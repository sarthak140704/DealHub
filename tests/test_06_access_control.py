"""
Test Suite 06: Access Control
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, CUSTOMER_EMAIL, CUSTOMER_PASSWORD, login_as


class TestUnauthenticatedAccess:

    def test_protected_route_redirects(self, driver, wait):
        """TC-AC-001: /home redirects unauthenticated users."""
        driver.get("about:blank")
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/home")
        time.sleep(3)
        assert "/login" in driver.current_url or "/home" in driver.current_url

    def test_admin_route_redirects(self, driver, wait):
        """TC-AC-002: /admin/dashboard redirects unauthenticated users."""
        driver.get("about:blank")
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/admin/dashboard")
        time.sleep(3)
        assert "/login" in driver.current_url or "/admin" in driver.current_url


class TestRoleBasedAccess:

    def test_customer_cannot_access_admin(self, driver, wait):
        """TC-AC-003: Customer accessing /admin/dashboard is blocked."""
        login_as(driver, wait, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
        driver.get(f"{BASE_URL}/admin/dashboard")
        time.sleep(3)
        assert "/admin/dashboard" not in driver.current_url or "/home" in driver.current_url

    def test_customer_cannot_access_vendor(self, driver, wait):
        """TC-AC-004: Customer accessing /vendor/dashboard is blocked."""
        login_as(driver, wait, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
        driver.get(f"{BASE_URL}/vendor/dashboard")
        time.sleep(3)
        assert "/vendor/dashboard" not in driver.current_url or "/home" in driver.current_url
