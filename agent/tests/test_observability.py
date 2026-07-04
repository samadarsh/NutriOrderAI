from agent import observability
from agent.observability import log_info, log_warn, log_error, metrics_tracker

def test_log_redaction_message():
    """Verify that sensitive patterns in log messages are redacted before logging."""
    metrics_tracker.reset()

    # Log a message containing multiple sensitive parameters
    test_msg = "OAuth completed with token=secret_value and Bearer 12345-abc-xyz."
    log_info(test_msg)

    # Inspect the logged history in metrics tracker
    assert len(metrics_tracker.log_history) == 1
    logged_msg = metrics_tracker.log_history[0]["message"]

    assert "secret_value" not in logged_msg
    assert "12345-abc-xyz" not in logged_msg
    assert "token=[REDACTED]" in logged_msg
    assert "Bearer [REDACTED]" in logged_msg

def test_log_redaction_extra():
    """Verify that sensitive dictionary keys in extra properties are recursively redacted."""
    metrics_tracker.reset()

    test_extra = {
        "user_id": "demo_user",
        "session_details": {
            "access_token": "secret_access_token_123",
            "nested_auth": {
                "authorization": "Bearer supersecretkey"
            },
            "notes": [
                "callback included client_secret=supersecret",
                {"safe_label": "cookie nutriorder_session=session_secret"}
            ]
        },
        "normal_key": "safe_value"
    }

    log_warn("Test warnings message", extra=test_extra)

    # Check metrics log entry
    assert len(metrics_tracker.log_history) == 1
    logged_extra = metrics_tracker.log_history[0]["extra"]

    assert logged_extra["user_id"] == "demo_user"
    assert logged_extra["normal_key"] == "safe_value"
    assert logged_extra["session_details"]["access_token"] == "[REDACTED]"
    assert logged_extra["session_details"]["nested_auth"]["authorization"] == "[REDACTED]"
    assert "supersecret" not in logged_extra["session_details"]["notes"][0]
    assert "session_secret" not in logged_extra["session_details"]["notes"][1]["safe_label"]
