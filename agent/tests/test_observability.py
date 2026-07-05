import json
from unittest.mock import patch

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

def test_mcp_client_logs_safe_metadata_without_raw_arguments():
    """Verify MCP tool-call logs avoid raw arguments and capture Swiggy metadata."""
    from mcp.mcp_client import SwiggyFoodMCPClient

    metrics_tracker.reset()

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            envelope = {
                "success": True,
                "data": {"restaurants": []},
                "_meta": {
                    "swiggy": {
                        "sessionId": "swiggy_session_123",
                        "deprecation": {"message": "old_field will be removed"},
                    }
                },
            }
            return {
                "jsonrpc": "2.0",
                "id": "mcp_test",
                "result": {
                    "_meta": {"swiggy": {"sessionId": "swiggy_session_123"}},
                    "content": [{"type": "text", "text": json.dumps(envelope)}],
                },
            }

    captured_payloads = []

    def fake_post(url, json=None, headers=None, timeout=None):
        captured_payloads.append(json)
        return FakeResponse()

    with patch("requests.post", side_effect=fake_post):
        client = SwiggyFoodMCPClient(base_url="https://mcp.test/food", token="test_token")
        res = client.call_tool(
            "search_menu",
            {
                "addressId": "addr_secret_home",
                "query": "private medical lunch",
                "couponCode": "SECRET50",
                "cartItems": [{"itemId": "item_secret", "quantity": 1}],
            },
        )

    assert res["success"] is True
    assert metrics_tracker.tool_calls == 1
    assert "mcp_tool.search_menu" in metrics_tracker.latencies
    assert captured_payloads[0]["id"].startswith("mcp_")

    history_blob = json.dumps(metrics_tracker.log_history)
    assert "addr_secret_home" not in history_blob
    assert "private medical lunch" not in history_blob
    assert "SECRET50" not in history_blob
    assert "query_length" in history_blob
    assert "cart_items_count" in history_blob
    assert "swiggy_session_123" in history_blob
    assert "mcp_deprecation" in history_blob
