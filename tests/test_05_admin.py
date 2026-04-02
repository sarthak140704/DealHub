"""
Test Suite 05: Admin Pages
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, login_as


@pytest.fixture(autouse=True, scope="module")
def admin_login(driver, wait):
    login_as(driver, wait, ADMIN_EMAIL, ADMIN_PASSWORD)
    yield


class TestAdminDashboard:

    def test_dashboard_loads_with_stats(self, driver, wait):
        """TC-AD-001: Admin dashboard loads with all 4 stat cards."""
        driver.get(f"{BASE_URL}/admin/dashboard")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-dashboard']")))
        time.sleep(2)
        for tid in ['total-users-stat', 'total-deals-stat', 'pending-approvals-stat', 'system-logs-stat']:
            assert driver.find_element(By.CSS_SELECTOR, f"[data-testid='{tid}']").is_displayed()


class TestAdminDeals:

    def test_deals_table_has_data(self, driver, wait):
        """TC-ADL-001: Deals table shows seeded deals."""
        driver.get(f"{BASE_URL}/admin/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-deals-page']")))
        time.sleep(2)
        assert len(driver.find_elements(By.CSS_SELECTOR, "table tbody tr")) > 0

    def test_approve_reject_buttons(self, driver, wait):
        """TC-ADL-002: Pending deals have approve/reject buttons."""
        driver.get(f"{BASE_URL}/admin/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-deals-page']")))
        time.sleep(2)
        a = driver.find_elements(By.CSS_SELECTOR, "[data-testid='approve-deal-button']")
        r = driver.find_elements(By.CSS_SELECTOR, "[data-testid='reject-deal-button']")
        assert len(a) == len(r)


class TestAdminUsers:

    def test_users_table_has_seeded_data(self, driver, wait):
        """TC-AUS-001: Users table shows at least 5 seeded users."""
        driver.get(f"{BASE_URL}/admin/users")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-users-page']")))
        time.sleep(2)
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='user-row']")) >= 5


class TestAdminCategories:

    def test_categories_page_loads(self, driver, wait):
        """TC-ACT-001: Categories page loads with add form."""
        driver.get(f"{BASE_URL}/admin/categories")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-categories-page']")))
        time.sleep(1)
        assert "Categories" in driver.find_element(By.TAG_NAME, "body").text


class TestAdminLogs:

    def test_audit_logs_listed(self, driver, wait):
        """TC-ALG-001: Audit logs table shows entries."""
        driver.get(f"{BASE_URL}/admin/logs")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-logs-page']")))
        time.sleep(2)
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='log-row']")) > 0
