#!/usr/bin/env python
import os
import sys
from dotenv import load_dotenv

def main():
    print("🔐 Swiggy Staging Credentials Validation Utility")
    print("==================================================")
    
    # Load env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if not os.path.exists(env_path):
        print("❌ Error: .env file not found at project root.")
        sys.exit(1)
        
    load_dotenv(env_path)
    
    # Retrieve configurations
    app_env = os.getenv("APP_ENV", "development")
    use_mock_mcp = os.getenv("USE_MOCK_MCP", "true").lower() == "true"
    swiggy_env = os.getenv("SWIGGY_ENV", "mock")
    client_id = os.getenv("SWIGGY_CLIENT_ID", "").strip()
    client_secret = os.getenv("SWIGGY_CLIENT_SECRET", "").strip()
    redirect_uri = os.getenv("SWIGGY_REDIRECT_URI", "").strip()
    mcp_base_url = os.getenv("SWIGGY_MCP_BASE_URL", "").strip()
    encryption_key = os.getenv("ENCRYPTION_KEY", "").strip()
    allow_place_order = os.getenv("ALLOW_PLACE_ORDER", "false").lower() == "true"

    # Status table
    print(f"1. Mode Configurations:")
    print(f"   - APP_ENV:            {app_env}")
    print(f"   - USE_MOCK_MCP:       {use_mock_mcp}")
    print(f"   - SWIGGY_ENV:         {swiggy_env}")
    print()

    errors = 0
    warnings = 0

    print("2. Staging Configuration Validation:")
    if use_mock_mcp:
        print("   ⚠️ WARNING: USE_MOCK_MCP is set to 'true'. To test staging, set USE_MOCK_MCP=false.")
        warnings += 1
    else:
        print("   ✅ Real MCP integration active (USE_MOCK_MCP=false).")

    if swiggy_env != "staging":
        print("   ⚠️ WARNING: SWIGGY_ENV is not set to 'staging'. Set SWIGGY_ENV=staging for live staging.")
        warnings += 1
    else:
        print("   ✅ SWIGGY_ENV is configured for staging.")

    # Client ID check
    if not client_id:
        print("   ❌ ERROR: SWIGGY_CLIENT_ID is empty.")
        errors += 1
    else:
        print(f"   ✅ SWIGGY_CLIENT_ID is set (length: {len(client_id)}).")

    # Client Secret check
    if not client_secret:
        print("   ❌ ERROR: SWIGGY_CLIENT_SECRET is empty.")
        errors += 1
    else:
        print(f"   ✅ SWIGGY_CLIENT_SECRET is set (length: {len(client_secret)}).")

    # Redirect URI check
    if not redirect_uri:
        print("   ❌ ERROR: SWIGGY_REDIRECT_URI is empty.")
        errors += 1
    elif not (redirect_uri.startswith("http://") or redirect_uri.startswith("https://")):
        print("   ❌ ERROR: SWIGGY_REDIRECT_URI must start with http:// or https://")
        errors += 1
    else:
        print(f"   ✅ SWIGGY_REDIRECT_URI is valid: {redirect_uri}")

    # Base URL check
    if not mcp_base_url:
        print("   ❌ ERROR: SWIGGY_MCP_BASE_URL is empty.")
        errors += 1
    else:
        print(f"   ✅ SWIGGY_MCP_BASE_URL is set: {mcp_base_url}")
        if "staging" not in mcp_base_url.lower() and "localhost" not in mcp_base_url.lower():
            print("   ⚠️ WARNING: BASE_URL does not contain 'staging'. Make sure this is the exact URL given by Swiggy.")
            warnings += 1

    # Encryption key check
    if not encryption_key:
        print("   ❌ ERROR: ENCRYPTION_KEY is empty. OAuth token storage requires a secure encryption key.")
        errors += 1
    elif len(encryption_key) < 32:
        print("   ❌ ERROR: ENCRYPTION_KEY length is less than 32 characters. Use a secure 32-byte hex key.")
        errors += 1
    else:
        print("   ✅ ENCRYPTION_KEY is set and meets minimum length constraints.")

    # Checkout placement lock check
    print()
    print("3. Checkout Safety Lock Status:")
    if allow_place_order:
        print("   ⚠️ WARNING: ALLOW_PLACE_ORDER is set to 'true'. This will allow order placement on the staging server.")
        warnings += 1
    else:
        print("   ✅ Checkout Safety Lock is active (ALLOW_PLACE_ORDER=false). Order placement attempts will be blocked with a 403 Forbidden.")

    print()
    print("==================================================")
    if errors > 0:
        print(f"❌ Validation failed with {errors} error(s) and {warnings} warning(s).")
        print("Please resolve the errors in your .env file before executing the dry run.")
        sys.exit(1)
    elif warnings > 0:
        print(f"⚠️ Validation passed with {warnings} warning(s). Check the warnings above before starting.")
    else:
        print("🎉 Validation passed! The environment configuration is fully staging dry-run ready.")

if __name__ == "__main__":
    main()
