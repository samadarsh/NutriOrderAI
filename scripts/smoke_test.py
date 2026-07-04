import sys
import argparse
import requests

def run_smoke_tests():
    parser = argparse.ArgumentParser(description="NutriOrder AI Smoke Test Suite")
    parser.add_argument("url", nargs="?", default="http://localhost:8000", help="Target backend server URL")
    parser.add_argument("--mode", choices=["mock", "staging"], default="mock", help="Deployment mode (mock or staging)")
    parser.add_argument("--cookie", help="Pre-authenticated nutriorder_session cookie value for staging mode testing")
    args = parser.parse_args()

    base_url = args.url.rstrip("/")
    print("Starting NutriOrder AI Smoke Test Suite...")
    print(f"Target URL: {base_url}")
    print(f"Test Mode: {args.mode.upper()}")
    print("-" * 50)

    try:
        # 1. Health check (Staging + Mock)
        res_health = requests.get(f"{base_url}/health")
        assert res_health.status_code == 200, "Health check failed"
        print("[OK] Health check passed.")

        # 2. Config status check (Staging + Mock)
        res_status = requests.get(f"{base_url}/auth/swiggy/status")
        assert res_status.status_code == 200, "Swiggy status check failed"
        status_data = res_status.json()
        print("[OK] Swiggy staging configuration status:")
        print(f"   - Mock Mode Active: {status_data.get('use_mock_mcp')}")
        print(f"   - DB Connection: {status_data.get('database_connected')}")
        print(f"   - Encryption Key: {status_data.get('encryption_key_configured')}")
        print(f"   - Client credentials: ID={status_data.get('client_id_configured')}, Secret={status_data.get('client_secret_configured')}")

        # Share session cookies across calls
        session = requests.Session()

        if args.mode == "staging":
            if not args.cookie:
                print("-" * 50)
                print("[INFO] Staging mode active: Authentication cookie was not provided via --cookie.")
                print("   Skipped authenticated endpoints (session start, address selection, coach, search).")
                print("Smoke test completed successfully (unauthenticated stage).")
                return 0
            else:
                # Attach user cookie
                session.cookies.set("nutriorder_session", args.cookie)
                print("[OK] Attached pre-authenticated nutriorder_session cookie.")
        else:
            # 3. Demo login (Mock only)
            res_login = session.post(f"{base_url}/auth/demo-login")
            assert res_login.status_code == 200, "Demo login failed"
            print("[OK] Authenticated demo login successfully.")

        # 4. Start session (Authenticated checks)
        res_sess = session.post(f"{base_url}/orders/session/start")
        assert res_sess.status_code == 200, "Start order session failed"
        session_id = res_sess.json()["session_id"]
        print(f"[OK] Spawned order session: {session_id}")

        # 5. Select address
        address_id = "addr_home"
        if args.mode == "staging":
            res_addresses = session.get(f"{base_url}/me/addresses")
            assert res_addresses.status_code == 200, "Fetching saved addresses failed"
            addresses = res_addresses.json()
            assert addresses, "No saved Swiggy addresses available for staging smoke test"
            address_id = addresses[0].get("id")
            assert address_id, "Saved address response did not include an id"

        res_addr = session.post(f"{base_url}/orders/session/{session_id}/select-address", params={"address_id": address_id})
        assert res_addr.status_code == 200, "Select address failed"
        print(f"[OK] Selected delivery location '{address_id}'.")

        # 6. Get coach status
        res_coach = session.get(f"{base_url}/coach/today")
        assert res_coach.status_code == 200, "Get coach status failed"
        coach_data = res_coach.json()
        print("[OK] Health Coach targets retrieved:")
        print(f"   - Calorie Target: {coach_data.get('target_calories')} kcal")
        print(f"   - Protein Target: {coach_data.get('target_protein')}g")

        # 7. Recommendation pipeline query
        search_payload = {
            "session_id": session_id,
            "query": "chicken salad"
        }
        res_search = session.post(f"{base_url}/recommendations/search", json=search_payload)
        assert res_search.status_code == 200, "Recommendation search failed"
        rec_data = res_search.json()
        rec_meal = rec_data.get("results", {}).get("recommendation", {})
        print("[OK] AI meal recommendation matches:")
        print(f"   - Recommended Meal: {rec_meal.get('item_name')} from {rec_meal.get('restaurant_name')}")
        print(f"   - Estimated macros: {rec_meal.get('protein_g')}g protein, {rec_meal.get('calories')} kcal")

        print("-" * 50)
        print("Smoke test suite completed successfully. Backend is healthy and staging-ready.")
        return 0

    except requests.exceptions.ConnectionError:
        print(f"[FAIL] Connection failed. Please make sure your backend server is running at: {base_url}")
        return 1
    except AssertionError as e:
        print(f"[FAIL] Smoke test failed: {str(e)}")
        return 1
    except Exception as e:
        print(f"[FAIL] Unexpected smoke test failure: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(run_smoke_tests())
