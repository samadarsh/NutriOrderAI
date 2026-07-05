import json
import logging
import re
import time
from collections import defaultdict
from typing import Any, Dict

# Config structured logger
logger = logging.getLogger("BiteWise")
logger.setLevel(logging.INFO)

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_data.update(record.extra_data)
        return json.dumps(log_data)

# Create console handler with JSON formatter
# Avoid adding duplicate handlers if already present
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(JSONFormatter())
    logger.addHandler(ch)

class MetricsTracker:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MetricsTracker, cls).__new__(cls)
            cls._instance.reset()
        return cls._instance

    def reset(self):
        self.latencies: Dict[str, list] = defaultdict(list)
        self.cache_hits: int = 0
        self.cache_misses: int = 0
        self.tool_calls: int = 0
        self.tool_failures: int = 0
        self.oauth_failures: int = 0
        self.recommendation_count: int = 0
        self.recommendation_failures: int = 0
        self.order_attempts: int = 0
        self.order_successes: int = 0
        self.order_failures: int = 0
        self.retries: int = 0
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.log_history: list[dict] = []

    def record_latency(self, metric_name: str, duration_sec: float):
        self.latencies[metric_name].append(duration_sec)

    def record_cache_hit(self):
        self.cache_hits += 1

    def record_cache_miss(self):
        self.cache_misses += 1

    def record_tool_call(self, success: bool = True):
        self.tool_calls += 1
        if not success:
            self.tool_failures += 1

    def record_oauth_failure(self):
        self.oauth_failures += 1

    def record_recommendation(self, success: bool = True):
        self.recommendation_count += 1
        if not success:
            self.recommendation_failures += 1

    def record_order(self, success: bool = True):
        self.order_attempts += 1
        if success:
            self.order_successes += 1
        else:
            self.order_failures += 1

    def record_retry(self):
        self.retries += 1

    def record_error(self, category: str):
        self.error_counts[category] += 1

    def add_log_entry(self, level: str, message: str, extra: Dict[str, Any] = None):
        entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "level": level,
            "message": message,
            "extra": extra or {}
        }
        self.log_history.append(entry)
        # Keep last 100 logs for UI display
        if len(self.log_history) > 100:
            self.log_history.pop(0)

    def get_metrics_summary(self) -> Dict[str, Any]:
        avg_latencies = {}
        for k, v in self.latencies.items():
            if v:
                avg_latencies[k] = sum(v) / len(v)
            else:
                avg_latencies[k] = 0.0

        total_cache = self.cache_hits + self.cache_misses
        hit_ratio = (self.cache_hits / total_cache) * 100 if total_cache > 0 else 0.0

        return {
            "avg_latencies_sec": avg_latencies,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "cache_hit_ratio_percent": round(hit_ratio, 2),
            "tool_calls": self.tool_calls,
            "tool_failures": self.tool_failures,
            "oauth_failures": self.oauth_failures,
            "recommendation_count": self.recommendation_count,
            "recommendation_failures": self.recommendation_failures,
            "order_attempts": self.order_attempts,
            "order_successes": self.order_successes,
            "order_failures": self.order_failures,
            "retries": self.retries,
            "error_counts": dict(self.error_counts),
        }

metrics_tracker = MetricsTracker()

SENSITIVE_KEYWORDS = [
    "authorization", "cookie", "set-cookie", "token",
    "access_token", "refresh_token", "client_secret",
    "password", "api_key", "encryption_key"
]

def _redact_string(value: str) -> str:
    value = re.sub(r'(?i)bearer\s+[a-zA-Z0-9_\-\.]+', 'Bearer [REDACTED]', value)
    value = re.sub(r'(?i)nutriorder_session=[a-zA-Z0-9_\-\.]+', 'nutriorder_session=[REDACTED]', value)
    value = re.sub(r'(?i)(token|api_key|client_secret|password|encryption_key)=[^&\s]+', r'\1=[REDACTED]', value)
    return value

def redact_sensitive_data(val: Any) -> Any:
    """
    Recursively redacts sensitive values matching authorization, cookies, tokens, or keys.
    """
    if isinstance(val, dict):
        redacted = {}
        for k, v in val.items():
            k_lower = k.lower()
            if any(s in k_lower for s in SENSITIVE_KEYWORDS):
                redacted[k] = "[REDACTED]"
            else:
                redacted[k] = redact_sensitive_data(v)
        return redacted
    elif isinstance(val, list):
        return [redact_sensitive_data(item) for item in val]
    elif isinstance(val, str):
        return _redact_string(val)
    return val

def redact_message(message: str) -> str:
    """
    Scans and redacts sensitive patterns in plain text log messages.
    """
    if not isinstance(message, str):
        return message
    return _redact_string(message)

def log_info(message: str, extra: Dict[str, Any] = None):
    extra_data = extra or {}
    redacted_message = redact_message(message)
    redacted_extra = redact_sensitive_data(extra_data)
    logger.info(redacted_message, extra={"extra_data": redacted_extra})
    metrics_tracker.add_log_entry("INFO", redacted_message, redacted_extra)

def log_warn(message: str, extra: Dict[str, Any] = None):
    extra_data = extra or {}
    redacted_message = redact_message(message)
    redacted_extra = redact_sensitive_data(extra_data)
    logger.warning(redacted_message, extra={"extra_data": redacted_extra})
    metrics_tracker.add_log_entry("WARNING", redacted_message, redacted_extra)

def log_error(message: str, error_category: str, extra: Dict[str, Any] = None):
    extra_data = extra or {}
    extra_data["error_category"] = error_category
    redacted_message = redact_message(message)
    redacted_extra = redact_sensitive_data(extra_data)
    logger.error(redacted_message, extra={"extra_data": redacted_extra})
    metrics_tracker.record_error(error_category)
    metrics_tracker.add_log_entry("ERROR", f"[{error_category}] {redacted_message}", redacted_extra)
