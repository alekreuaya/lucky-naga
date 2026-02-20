import requests
import sys
from datetime import datetime
import json

class LuckyWheelAPITester:
    def __init__(self, base_url="https://naga-spin.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'message' in response_data:
                        print(f"   Message: {response_data['message']}")
                except:
                    pass
                self.results[name] = {"status": "PASSED", "response_code": response.status_code}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                self.results[name] = {"status": "FAILED", "response_code": response.status_code}

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.results[name] = {"status": "ERROR", "error": str(e)}
            return False, {}

    def test_master_login(self):
        """Test master admin login with new credentials"""
        success, response = self.run_test(
            "Master Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": "master", "password": "dragonmaster2024!"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Role: {response.get('role', 'unknown')}")
            return True
        return False

    def test_admin1_login(self):
        """Test admin1 login with new credentials"""
        success, response = self.run_test(
            "Admin1 Login",
            "POST",
            "admin/login",
            200,
            data={"username": "admin1", "password": "admin1pass"}
        )
        if success and 'token' in response:
            print(f"   Role: {response.get('role', 'unknown')}")
            return True
        return False

    def test_change_password_valid(self):
        """Test change password with correct current password"""
        success, response = self.run_test(
            "Change Password - Valid Current",
            "POST",
            "admin/change-password",
            200,
            data={
                "current_password": "dragonmaster2024!",
                "new_password": "newmaster123!"
            }
        )
        return success

    def test_change_password_invalid(self):
        """Test change password with wrong current password"""
        success, response = self.run_test(
            "Change Password - Invalid Current",
            "POST",
            "admin/change-password",
            400,
            data={
                "current_password": "wrongpassword",
                "new_password": "newmaster123!"
            }
        )
        return success

    def test_change_password_back(self):
        """Change password back to original for other tests"""
        success, response = self.run_test(
            "Change Password Back to Original",
            "POST",
            "admin/change-password",
            200,
            data={
                "current_password": "newmaster123!",
                "new_password": "dragonmaster2024!"
            }
        )
        return success

    def test_generate_codes(self):
        """Test code generation"""
        test_usernames = [f"test_user_{datetime.now().strftime('%H%M%S')}", "test_user_2"]
        success, response = self.run_test(
            "Generate Codes",
            "POST",
            "admin/generate-codes",
            200,
            data={"usernames": test_usernames}
        )
        if success and response.get('codes'):
            print(f"   Generated {len(response['codes'])} codes")
            return response['codes']
        return []

    def test_spin_wheel(self, username, redeem_code):
        """Test wheel spin functionality"""
        success, response = self.run_test(
            "Spin Wheel",
            "POST",
            "spin",
            200,
            data={"username": username, "redeem_code": redeem_code}
        )
        if success and response.get('prize'):
            print(f"   Won: {response['prize']['label']}")
            return True
        return False

    def test_get_prizes(self):
        """Test getting prizes"""
        success, response = self.run_test(
            "Get Prizes",
            "GET",
            "prizes",
            200
        )
        if success and response.get('prizes'):
            print(f"   Found {len(response['prizes'])} prizes")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        if success:
            print(f"   Total codes: {response.get('total_codes', 0)}")
            print(f"   Total draws: {response.get('total_draws', 0)}")
            return True
        return False

def main():
    # Setup
    tester = LuckyWheelAPITester()
    
    print("🐉 Testing Lucky Wheel API - Dragon Theme Edition\n")
    print(f"Base URL: {tester.base_url}")
    print("="*60)

    # Test 1: Master admin login
    if not tester.test_master_login():
        print("❌ Master login failed, stopping critical tests")
        # Continue with remaining tests that don't require auth
        
    # Test 2: Admin1 login (separate token)
    admin1_success = tester.test_admin1_login()
    
    # Test 3: Change password functionality (if master login worked)
    if tester.token:
        # Test valid password change
        if tester.test_change_password_valid():
            # Change password back to original
            tester.test_change_password_back()
        
        # Test invalid password change
        tester.test_change_password_invalid()
        
        # Test other admin endpoints
        generated_codes = tester.test_generate_codes()
        tester.test_admin_stats()
        
        # Test spin functionality if codes were generated
        if generated_codes and len(generated_codes) > 0:
            code_data = generated_codes[0]
            tester.test_spin_wheel(code_data['username'], code_data['redeem_code'])
    
    # Test public endpoints (don't require auth)
    tester.test_get_prizes()

    # Print final results
    print("\n" + "="*60)
    print(f"📊 Backend API Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    # Detailed results
    print("\nDetailed Results:")
    for test_name, result in tester.results.items():
        status_icon = "✅" if result['status'] == "PASSED" else "❌"
        print(f"{status_icon} {test_name}: {result['status']}")
        if result['status'] == "FAILED":
            print(f"    Response Code: {result['response_code']}")
        elif result['status'] == "ERROR":
            print(f"    Error: {result['error']}")

    # Return status based on critical functionality
    critical_passed = tester.results.get("Master Admin Login", {}).get("status") == "PASSED"
    change_password_passed = tester.results.get("Change Password - Valid Current", {}).get("status") == "PASSED"
    
    if critical_passed and change_password_passed:
        print("\n✅ Critical backend functionality working")
        return 0
    else:
        print("\n❌ Critical backend issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())