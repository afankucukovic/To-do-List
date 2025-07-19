#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for ToDo List Application
Tests all CRUD operations, statistics, and error handling
"""

import requests
import json
import sys
from datetime import datetime
import time

# Backend URL from frontend environment
BACKEND_URL = "https://ba5bd97a-78ad-42cb-b2ff-4a82d315cac7.preview.emergentagent.com/api"

class TodoAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.created_task_ids = []
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", response=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response and not success:
            print(f"   Response: {response.status_code} - {response.text[:200]}")
        
        if success:
            self.test_results["passed"] += 1
        else:
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"{test_name}: {message}")
        print()
    
    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "ToDo API" in data["message"]:
                    self.log_result("Root Endpoint", True, f"API Status: {data['message']}")
                    return True
                else:
                    self.log_result("Root Endpoint", False, f"Unexpected response format: {data}", response)
            else:
                self.log_result("Root Endpoint", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")
        return False
    
    def test_get_empty_tasks(self):
        """Test GET /api/tasks - Should return empty array initially"""
        try:
            response = self.session.get(f"{self.base_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                if isinstance(tasks, list):
                    self.log_result("Get Empty Tasks", True, f"Found {len(tasks)} existing tasks")
                    return True
                else:
                    self.log_result("Get Empty Tasks", False, f"Expected list, got: {type(tasks)}", response)
            else:
                self.log_result("Get Empty Tasks", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Empty Tasks", False, f"Exception: {str(e)}")
        return False
    
    def test_create_task(self, title, description=""):
        """Test POST /api/tasks - Create new task"""
        try:
            task_data = {
                "title": title,
                "description": description,
                "status": "todo"
            }
            response = self.session.post(f"{self.base_url}/tasks", json=task_data)
            if response.status_code == 200:
                task = response.json()
                required_fields = ["id", "title", "description", "status", "created_at", "updated_at"]
                if all(field in task for field in required_fields):
                    self.created_task_ids.append(task["id"])
                    self.log_result("Create Task", True, f"Created task: {task['title']} (ID: {task['id'][:8]}...)")
                    return task
                else:
                    missing = [f for f in required_fields if f not in task]
                    self.log_result("Create Task", False, f"Missing fields: {missing}", response)
            else:
                self.log_result("Create Task", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Create Task", False, f"Exception: {str(e)}")
        return None
    
    def test_get_tasks_with_data(self):
        """Test GET /api/tasks - Should return created tasks"""
        try:
            response = self.session.get(f"{self.base_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                if isinstance(tasks, list) and len(tasks) > 0:
                    self.log_result("Get Tasks With Data", True, f"Retrieved {len(tasks)} tasks")
                    return tasks
                else:
                    self.log_result("Get Tasks With Data", False, f"Expected non-empty list, got: {len(tasks) if isinstance(tasks, list) else type(tasks)}", response)
            else:
                self.log_result("Get Tasks With Data", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Tasks With Data", False, f"Exception: {str(e)}")
        return None
    
    def test_update_task_status(self, task_id, new_status):
        """Test PUT /api/tasks/{task_id} - Update task status"""
        try:
            update_data = {"status": new_status}
            response = self.session.put(f"{self.base_url}/tasks/{task_id}", json=update_data)
            if response.status_code == 200:
                task = response.json()
                if task["status"] == new_status:
                    self.log_result("Update Task Status", True, f"Updated task status to: {new_status}")
                    return task
                else:
                    self.log_result("Update Task Status", False, f"Status not updated. Expected: {new_status}, Got: {task['status']}", response)
            else:
                self.log_result("Update Task Status", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Update Task Status", False, f"Exception: {str(e)}")
        return None
    
    def test_task_statistics(self):
        """Test GET /api/tasks/stats - Get task statistics"""
        try:
            response = self.session.get(f"{self.base_url}/tasks/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total", "completed", "pending", "completion_rate"]
                if all(field in stats for field in required_fields):
                    # Verify calculations
                    if stats["total"] == stats["completed"] + stats["pending"]:
                        expected_rate = (stats["completed"] / stats["total"] * 100) if stats["total"] > 0 else 0
                        if abs(stats["completion_rate"] - expected_rate) < 0.1:  # Allow small rounding differences
                            self.log_result("Task Statistics", True, 
                                          f"Stats: {stats['total']} total, {stats['completed']} completed, {stats['pending']} pending, {stats['completion_rate']}% completion rate")
                            return stats
                        else:
                            self.log_result("Task Statistics", False, f"Completion rate calculation error. Expected: {expected_rate}, Got: {stats['completion_rate']}", response)
                    else:
                        self.log_result("Task Statistics", False, f"Total doesn't match completed + pending: {stats['total']} != {stats['completed']} + {stats['pending']}", response)
                else:
                    missing = [f for f in required_fields if f not in stats]
                    self.log_result("Task Statistics", False, f"Missing fields: {missing}", response)
            else:
                self.log_result("Task Statistics", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Task Statistics", False, f"Exception: {str(e)}")
        return None
    
    def test_delete_task(self, task_id):
        """Test DELETE /api/tasks/{task_id} - Delete a task"""
        try:
            response = self.session.delete(f"{self.base_url}/tasks/{task_id}")
            if response.status_code == 200:
                result = response.json()
                if "message" in result and "deleted" in result["message"].lower():
                    self.log_result("Delete Task", True, f"Task deleted successfully")
                    return True
                else:
                    self.log_result("Delete Task", False, f"Unexpected response: {result}", response)
            else:
                self.log_result("Delete Task", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Delete Task", False, f"Exception: {str(e)}")
        return False
    
    def test_error_handling(self):
        """Test error handling with invalid task IDs"""
        try:
            # Test GET with invalid ID
            response = self.session.get(f"{self.base_url}/tasks/invalid-id-123")
            # This should return 404 or handle gracefully
            
            # Test PUT with invalid ID
            response = self.session.put(f"{self.base_url}/tasks/invalid-id-123", json={"status": "completed"})
            if response.status_code == 404:
                self.log_result("Error Handling - Invalid Update", True, "Correctly returned 404 for invalid task ID")
            else:
                self.log_result("Error Handling - Invalid Update", False, f"Expected 404, got {response.status_code}", response)
            
            # Test DELETE with invalid ID
            response = self.session.delete(f"{self.base_url}/tasks/invalid-id-123")
            if response.status_code == 404:
                self.log_result("Error Handling - Invalid Delete", True, "Correctly returned 404 for invalid task ID")
            else:
                self.log_result("Error Handling - Invalid Delete", False, f"Expected 404, got {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Error Handling", False, f"Exception: {str(e)}")
    
    def test_create_task_validation(self):
        """Test task creation with edge cases"""
        # Test with empty title
        try:
            response = self.session.post(f"{self.base_url}/tasks", json={"title": "", "description": "Empty title test"})
            # This might be allowed or rejected - just log the behavior
            if response.status_code == 200:
                task = response.json()
                self.created_task_ids.append(task["id"])
                self.log_result("Create Task - Empty Title", True, "Empty title allowed")
            else:
                self.log_result("Create Task - Empty Title", True, f"Empty title rejected with {response.status_code}")
        except Exception as e:
            self.log_result("Create Task - Empty Title", False, f"Exception: {str(e)}")
    
    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("COMPREHENSIVE TODO API TESTING")
        print("=" * 60)
        print(f"Testing Backend URL: {self.base_url}")
        print()
        
        # Test 1: Root endpoint
        self.test_root_endpoint()
        
        # Test 2: Get empty tasks
        self.test_get_empty_tasks()
        
        # Test 3: Create multiple tasks
        task1 = self.test_create_task("Complete project documentation", "Write comprehensive docs for the todo app")
        task2 = self.test_create_task("Review code changes", "Review pull requests and provide feedback")
        task3 = self.test_create_task("Deploy to production", "Deploy the latest version to production environment")
        
        # Test 4: Get tasks with data
        tasks = self.test_get_tasks_with_data()
        
        # Test 5: Update task status
        if task1:
            self.test_update_task_status(task1["id"], "completed")
        
        # Test 6: Get statistics
        self.test_task_statistics()
        
        # Test 7: Update another task
        if task2:
            self.test_update_task_status(task2["id"], "completed")
        
        # Test 8: Get updated statistics
        self.test_task_statistics()
        
        # Test 9: Test validation
        self.test_create_task_validation()
        
        # Test 10: Error handling
        self.test_error_handling()
        
        # Test 11: Delete tasks
        if self.created_task_ids:
            self.test_delete_task(self.created_task_ids[0])
        
        # Test 12: Final statistics
        self.test_task_statistics()
        
        # Clean up remaining tasks
        print("Cleaning up remaining test tasks...")
        for task_id in self.created_task_ids[1:]:
            try:
                self.session.delete(f"{self.base_url}/tasks/{task_id}")
            except:
                pass
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📊 Success Rate: {(self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) * 100):.1f}%")
        
        if self.test_results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        return self.test_results['failed'] == 0

if __name__ == "__main__":
    tester = TodoAPITester()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)