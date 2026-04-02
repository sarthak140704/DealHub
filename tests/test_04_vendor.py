"""
Test Suite 04: Vendor Pages
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, VENDOR_EMAIL, VENDOR_PASSWORD, login_as


@pytest.fixture(autouse=True, scope="module")
def vendor_login(driver, wait):
    login_as(driver, wait, VENDOR_EMAIL, VENDOR_PASSWORD)
    yield


class TestVendorDashboard:

    def test_dashboard_loads_with_stats(self, driver, wait):
        """TC-VD-001: Vendor dashboard loads with stat cards."""
        driver.get(f"{BASE_URL}/vendor/dashboard")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='vendor-dashboard']")))
        time.sleep(2)
        for tid in ['total-deals', 'active-deals', 'pending-deals', 'expired-deals']:
            assert driver.find_element(By.CSS_SELECTOR, f"[data-testid='{tid}']").is_displayed()


class TestVendorDeals:

    def test_deals_listed(self, driver, wait):
        """TC-VDL-001: Vendor's seeded deals are listed."""
        driver.get(f"{BASE_URL}/vendor/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='vendor-deals-page']")))
        time.sleep(2)
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='vendor-deal-card']")
        assert len(cards) > 0

    def test_deal_cards_have_actions(self, driver, wait):
        """TC-VDL-002: Deal cards have edit and delete buttons."""
        driver.get(f"{BASE_URL}/vendor/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='vendor-deals-page']")))
        time.sleep(2)
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='edit-deal-button']")) > 0
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='delete-deal-button']")) > 0


class TestNewDeal:

    def test_new_deal_form_renders(self, driver, wait):
        """TC-VND-001: New deal form has all required fields."""
        driver.get(f"{BASE_URL}/vendor/deals/new")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='new-deal-page']")))
        time.sleep(2)
        for tid in ['deal-title-input', 'deal-description-input', 'deal-price-input',
                     'deal-discount-price-input', 'deal-url-input', 'deal-expiry-input',
                     'deal-category-select', 'submit-deal-form-button']:
            assert len(driver.find_elements(By.CSS_SELECTOR, f"[data-testid='{tid}']")) > 0

    def test_submit_deal_end_to_end(self, driver, wait):
        """TC-VND-002: Submitting a valid deal redirects to deals list."""
        driver.get(f"{BASE_URL}/vendor/deals/new")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='new-deal-page']")))
        time.sleep(2)

        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-title-input']").send_keys("Selenium Test Deal")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-description-input']").send_keys("Automated test deal.")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-price-input']").send_keys("500")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-discount-price-input']").send_keys("399")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-url-input']").send_keys("https://example.com/test")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-expiry-input']").send_keys("2027-12-31")

        from selenium.webdriver.support.select import Select
        Select(driver.find_element(By.CSS_SELECTOR, "[data-testid='deal-category-select']")).select_by_index(1)

        driver.find_element(By.CSS_SELECTOR, "[data-testid='submit-deal-form-button']").click()
        time.sleep(3)
        assert "/vendor/deals" in driver.current_url


class TestVendorAnalytics:

    def test_analytics_page_loads(self, driver, wait):
        """TC-VA-001: Analytics page loads."""
        driver.get(f"{BASE_URL}/vendor/analytics")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='vendor-analytics-page']")))
        time.sleep(1)
        assert "Analytics" in driver.find_element(By.TAG_NAME, "body").text
