"""
Test Suite 02: Authentication
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import (
    BASE_URL, CUSTOMER_EMAIL, CUSTOMER_PASSWORD,
    ADMIN_EMAIL, ADMIN_PASSWORD, VENDOR_EMAIL, VENDOR_PASSWORD,
    login_as, logout,
)


class TestLogin:

    def test_login_form_renders(self, driver, wait):
        """TC-AU-001: Login page renders email, password, and submit."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.visibility_of_element_located((By.ID, "email")))
        assert driver.find_element(By.ID, "password").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='login-button']").is_displayed()

    def test_wrong_credentials_rejected(self, driver, wait):
        """TC-AU-002: Wrong password keeps user on login page."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/login")
        wait.until(EC.visibility_of_element_located((By.ID, "email")))
        driver.find_element(By.ID, "email").send_keys(CUSTOMER_EMAIL)
        driver.find_element(By.ID, "password").send_keys("wrongpassword")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='login-button']").click()
        time.sleep(3)
        assert "/login" in driver.current_url

    def test_customer_login_redirects_home(self, driver, wait):
        """TC-AU-003: Customer login redirects to /home."""
        login_as(driver, wait, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
        assert "/home" in driver.current_url

    def test_vendor_login_redirects_dashboard(self, driver, wait):
        """TC-AU-004: Vendor login redirects to /vendor/dashboard."""
        login_as(driver, wait, VENDOR_EMAIL, VENDOR_PASSWORD)
        assert "/vendor/dashboard" in driver.current_url

    def test_admin_login_redirects_dashboard(self, driver, wait):
        """TC-AU-005: Admin login redirects to /admin/dashboard."""
        login_as(driver, wait, ADMIN_EMAIL, ADMIN_PASSWORD)
        assert "/admin/dashboard" in driver.current_url

    def test_logout_clears_session(self, driver, wait):
        """TC-AU-006: Logout clears session cookies."""
        login_as(driver, wait, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
        logout(driver, wait)
        assert len(driver.get_cookies()) == 0


class TestRegister:

    def test_register_form_renders(self, driver, wait):
        """TC-AU-007: Register page has all required fields."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/register")
        wait.until(EC.visibility_of_element_located((By.ID, "username")))
        assert driver.find_element(By.ID, "email").is_displayed()
        assert driver.find_element(By.ID, "password").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='role-select']").is_displayed()

    def test_vendor_role_shows_company_field(self, driver, wait):
        """TC-AU-008: Selecting VENDOR shows company name input."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/register")
        wait.until(EC.visibility_of_element_located((By.ID, "username")))
        from selenium.webdriver.support.select import Select
        Select(driver.find_element(By.CSS_SELECTOR, "[data-testid='role-select']")).select_by_value("VENDOR")
        time.sleep(1)
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='company-name-input']").is_displayed()

    def test_duplicate_email_rejected(self, driver, wait):
        """TC-AU-009: Duplicate email registration stays on page."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/register")
        wait.until(EC.visibility_of_element_located((By.ID, "username")))
        driver.find_element(By.ID, "username").send_keys("newuser999")
        driver.find_element(By.ID, "email").send_keys(CUSTOMER_EMAIL)
        driver.find_element(By.ID, "password").send_keys("password123")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='register-button']").click()
        time.sleep(3)
        assert "/register" in driver.current_url
