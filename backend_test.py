import requests
import sys
import json
from datetime import datetime

class LuckyWheelAPITester:
    def __init__(self, base_url="https://fortune-wheel-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.master_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {error_msg}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "response": response_data,
            "error": error_msg
        })

    def test_get_prizes(self):
        """Test GET /api/prizes - should have image_url and probability fields, no points"""
        try:
            response = requests.get(f"{self.base_url}/prizes", timeout=10)
            if response.status_code == 200:
                data = response.json()
                prizes = data.get("prizes", [])
                if len(prizes) >= 1:
                    # Check prize structure
                    sample_prize = prizes[0]
                    has_image_url = "image_url" in sample_prize
                    has_probability = "probability" in sample_prize
                    has_points = "points" in sample_prize
                    
                    if has_image_url and has_probability and not has_points:
                        self.log_test("GET /api/prizes (new structure)", True, f"Found {len(prizes)} prizes with correct fields")
                        return True
                    else:
                        issues = []
                        if not has_image_url: issues.append("missing image_url")
                        if not has_probability: issues.append("missing probability")
                        if has_points: issues.append("still has points field")
                        self.log_test("GET /api/prizes (new structure)", False, error_msg=f"Prize structure issues: {', '.join(issues)}")
                else:
                    self.log_test("GET /api/prizes", False, error_msg=f"No prizes found")
            else:
                self.log_test("GET /api/prizes", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/prizes", False, error_msg=str(e))
        return False

    def test_master_admin_login(self):
        """Test POST /api/admin/login with master credentials"""
        try:
            payload = {"username": "master", "password": "dragonmaster2024!"}
            response = requests.post(f"{self.base_url}/admin/login", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "token" in data and data.get("role") == "master":
                    self.master_token = data["token"]
                    self.log_test("Master admin login", True, "Master token received with correct role")
                    return True
                else:
                    self.log_test("Master admin login", False, error_msg=f"Missing token or wrong role: {data}")
            else:
                self.log_test("Master admin login", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Master admin login", False, error_msg=str(e))
        return False

    def test_sub_admin_login(self):
        """Test POST /api/admin/login with sub-admin credentials"""
        try:
            payload = {"username": "admin1", "password": "admin1pass"}
            response = requests.post(f"{self.base_url}/admin/login", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "token" in data and data.get("role") == "admin":
                    self.admin_token = data["token"]
                    self.log_test("Sub-admin login", True, "Sub-admin token received with correct role")
                    return True
                else:
                    self.log_test("Sub-admin login", False, error_msg=f"Missing token or wrong role: {data}")
            else:
                # If admin1 doesn't exist yet, that's expected - we'll create it later
                if response.status_code == 401:
                    self.log_test("Sub-admin login (expected to fail initially)", True, "Admin1 doesn't exist yet - will be created by master")
                    return True
                else:
                    self.log_test("Sub-admin login", False, error_msg=f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Sub-admin login", False, error_msg=str(e))
        return False

    def test_create_admin_with_master(self):
        """Test POST /api/admin/create-admin with master token"""
        if not self.master_token:
            self.log_test("Create admin (master)", False, error_msg="No master token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.master_token}"}
            payload = {"username": "admin1", "password": "admin1pass"}
            response = requests.post(f"{self.base_url}/admin/create-admin", json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                self.log_test("Create admin (master)", True, "Admin created successfully")
                return True
            elif response.status_code == 400 and "already exists" in response.json().get("detail", ""):
                self.log_test("Create admin (master)", True, "Admin already exists - that's fine")
                return True
            else:
                self.log_test("Create admin (master)", False, error_msg=f"Status code: {response.status_code}, detail: {response.json()}")
        except Exception as e:
            self.log_test("Create admin (master)", False, error_msg=str(e))
        return False

    def test_create_admin_with_sub_admin(self):
        """Test POST /api/admin/create-admin with sub-admin token (should fail)"""
        if not self.admin_token:
            # Try to get sub-admin token first
            try:
                payload = {"username": "admin1", "password": "admin1pass"}
                response = requests.post(f"{self.base_url}/admin/login", json=payload, timeout=10)
                if response.status_code == 200:
                    self.admin_token = response.json()["token"]
            except:
                self.log_test("Create admin (sub-admin forbidden)", False, error_msg="No sub-admin token available")
                return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {"username": "test_admin", "password": "testpass"}
            response = requests.post(f"{self.base_url}/admin/create-admin", json=payload, headers=headers, timeout=10)
            if response.status_code == 403:
                self.log_test("Create admin (sub-admin forbidden)", True, "Correctly forbidden for sub-admin")
                return True
            else:
                self.log_test("Create admin (sub-admin forbidden)", False, error_msg=f"Expected 403, got {response.status_code}")
        except Exception as e:
            self.log_test("Create admin (sub-admin forbidden)", False, error_msg=str(e))
        return False

    def test_list_admins(self):
        """Test GET /api/admin/admins (master only)"""
        if not self.master_token:
            self.log_test("List admins", False, error_msg="No master token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.master_token}"}
            response = requests.get(f"{self.base_url}/admin/admins", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                admins = data.get("admins", [])
                master_found = any(admin.get("role") == "master" for admin in admins)
                if master_found:
                    self.log_test("List admins", True, f"Found {len(admins)} admins including master")
                    return True
                else:
                    self.log_test("List admins", False, error_msg="Master admin not found in list")
            else:
                self.log_test("List admins", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("List admins", False, error_msg=str(e))
        return False

    def test_delete_admin(self):
        """Test DELETE /api/admin/admins/admin1 with master token"""
        if not self.master_token:
            self.log_test("Delete admin", False, error_msg="No master token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.master_token}"}
            response = requests.delete(f"{self.base_url}/admin/admins/admin1", headers=headers, timeout=10)
            if response.status_code == 200:
                self.log_test("Delete admin", True, "Admin deleted successfully")
                return True
            elif response.status_code == 404:
                self.log_test("Delete admin", True, "Admin not found - already deleted or never created")
                return True
            else:
                self.log_test("Delete admin", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Delete admin", False, error_msg=str(e))
        return False

    def test_generate_codes(self):
        """Test POST /api/admin/generate-codes"""
        if not self.admin_token:
            self.log_test("Generate codes", False, error_msg="No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {"count": 2, "prefix": "TEST"}
            response = requests.post(f"{self.base_url}/admin/generate-codes", json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                codes = data.get("codes", [])
                if len(codes) == 2:
                    self.log_test("Generate codes", True, f"Generated {len(codes)} codes")
                    return codes
                else:
                    self.log_test("Generate codes", False, error_msg=f"Expected 2 codes, got {len(codes)}")
            else:
                self.log_test("Generate codes", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Generate codes", False, error_msg=str(e))
        return False

    def test_get_codes(self):
        """Test GET /api/admin/codes"""
        if not self.admin_token:
            self.log_test("Get codes", False, error_msg="No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/codes", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                codes = data.get("codes", [])
                self.log_test("Get codes", True, f"Retrieved {len(codes)} codes")
                return codes
            else:
                self.log_test("Get codes", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get codes", False, error_msg=str(e))
        return False

    def test_spin_valid_code(self, codes):
        """Test POST /api/spin with valid unused code"""
        if not codes or len(codes) == 0:
            self.log_test("Spin with valid code", False, error_msg="No test codes available")
            return False
        
        try:
            # Find an unused code
            unused_code = None
            for code in codes:
                if not code.get("is_used", False):
                    unused_code = code
                    break
            
            if not unused_code:
                self.log_test("Spin with valid code", False, error_msg="No unused codes available")
                return False
            
            payload = {
                "username": unused_code["username"],
                "redeem_code": unused_code["redeem_code"]
            }
            response = requests.post(f"{self.base_url}/spin", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "prize" in data:
                    self.log_test("Spin with valid code", True, f"Won: {data['prize']['label']}")
                    return True
                else:
                    self.log_test("Spin with valid code", False, error_msg="No prize in response")
            else:
                self.log_test("Spin with valid code", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Spin with valid code", False, error_msg=str(e))
        return False

    def test_spin_used_code(self, codes):
        """Test POST /api/spin with already used code"""
        if not codes or len(codes) == 0:
            self.log_test("Spin with used code", False, error_msg="No test codes available")
            return False
        
        try:
            # Find a used code or use the first one (which should be used after previous test)
            used_code = None
            for code in codes:
                if code.get("is_used", False):
                    used_code = code
                    break
            
            # If no used code found, use first one and try twice
            if not used_code:
                used_code = codes[0]
            
            payload = {
                "username": used_code["username"],
                "redeem_code": used_code["redeem_code"]
            }
            response = requests.post(f"{self.base_url}/spin", json=payload, timeout=10)
            if response.status_code == 400:
                data = response.json()
                if "already been used" in data.get("detail", ""):
                    self.log_test("Spin with used code", True, "Correctly rejected used code")
                    return True
                else:
                    self.log_test("Spin with used code", False, error_msg=f"Wrong error message: {data.get('detail')}")
            else:
                self.log_test("Spin with used code", False, error_msg=f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Spin with used code", False, error_msg=str(e))
        return False

    def test_spin_invalid_credentials(self):
        """Test POST /api/spin with invalid credentials"""
        try:
            payload = {
                "username": "invalid_user_123",
                "redeem_code": "INVALID_CODE"
            }
            response = requests.post(f"{self.base_url}/spin", json=payload, timeout=10)
            if response.status_code == 400:
                self.log_test("Spin with invalid credentials", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_test("Spin with invalid credentials", False, error_msg=f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Spin with invalid credentials", False, error_msg=str(e))
        return False

    def test_get_history(self):
        """Test GET /api/history"""
        try:
            response = requests.get(f"{self.base_url}/history", timeout=10)
            if response.status_code == 200:
                data = response.json()
                history = data.get("history", [])
                self.log_test("Get history", True, f"Retrieved {len(history)} history items")
                return True
            else:
                self.log_test("Get history", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get history", False, error_msg=str(e))
        return False

    def test_update_prizes(self):
        """Test PUT /api/admin/prizes"""
        if not self.admin_token:
            self.log_test("Update prizes", False, error_msg="No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            # Create test prize pool
            test_prizes = [
                {"label": "Test Prize 1", "points": 100, "color": "#8B5CF6", "probability": 0.5},
                {"label": "Test Prize 2", "points": 200, "color": "#F472B6", "probability": 0.5},
            ]
            payload = {"prizes": test_prizes}
            response = requests.put(f"{self.base_url}/admin/prizes", json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                self.log_test("Update prizes", True, "Prize pool updated successfully")
                return True
            else:
                self.log_test("Update prizes", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Update prizes", False, error_msg=str(e))
        return False

    def test_get_stats(self):
        """Test GET /api/admin/stats"""
        if not self.admin_token:
            self.log_test("Get stats", False, error_msg="No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/stats", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_codes", "used_codes", "unused_codes", "total_draws"]
                if all(field in data for field in required_fields):
                    self.log_test("Get stats", True, f"Retrieved stats with all required fields")
                    return True
                else:
                    missing = [field for field in required_fields if field not in data]
                    self.log_test("Get stats", False, error_msg=f"Missing fields: {missing}")
            else:
                self.log_test("Get stats", False, error_msg=f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get stats", False, error_msg=str(e))
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧪 Starting Lucky Wheel Backend API Tests")
        print("=" * 50)
        
        # Test basic endpoints first
        self.test_get_prizes()
        self.test_get_history()
        
        # Test admin authentication
        self.test_admin_login_wrong()
        self.test_admin_login_correct()
        
        # Test admin-only endpoints (requires token)
        if self.admin_token:
            generated_codes = self.test_generate_codes()
            all_codes = self.test_get_codes()
            
            # Test spinning functionality
            if all_codes:
                self.test_spin_valid_code(all_codes)
                # Refresh codes to get updated status
                updated_codes = self.test_get_codes()
                if updated_codes:
                    self.test_spin_used_code(updated_codes)
            
            self.test_spin_invalid_credentials()
            self.test_update_prizes()
            self.test_get_stats()
        else:
            print("⚠️ Skipping admin tests - no token available")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Backend API Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    print(f"🚀 Testing Lucky Wheel API at: https://fortune-wheel-hub.preview.emergentagent.com/api")
    print(f"⏰ Started at: {datetime.now()}")
    
    tester = LuckyWheelAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/test_reports/backend_api_test.json", "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": round((tester.tests_passed / tester.tests_run) * 100, 2) if tester.tests_run > 0 else 0,
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())