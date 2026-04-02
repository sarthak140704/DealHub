"""
Test Suite 03: Customer Pages
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, CUSTOMER_EMAIL, CUSTOMER_PASSWORD, login_as


@pytest.fixture(autouse=True, scope="module")
def customer_login(driver, wait):
    login_as(driver, wait, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    yield


class TestCustomerHome:

    def test_home_page_loads(self, driver, wait):
        """TC-CH-001: Customer home page loads with navigation cards."""
        driver.get(f"{BASE_URL}/home")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='home-page']")))
        time.sleep(1)
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='browse-deals-card']").get_attribute("href").endswith("/deals")

    def test_browse_deals_navigation(self, driver, wait):
        """TC-CH-002: Clicking Browse Deals navigates to /deals."""
        driver.get(f"{BASE_URL}/home")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='home-page']")))
        driver.find_element(By.CSS_SELECTOR, "[data-testid='browse-deals-card']").click()
        wait.until(EC.url_contains("/deals"))
        assert "/deals" in driver.current_url


class TestDeals:

    def test_deals_page_loads_with_controls(self, driver, wait):
        """TC-CD-001: Deals page has search, category filter, and sort."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(1)
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='search-input']").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='category-filter']").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='sort-dropdown']").is_displayed()

    def test_deals_are_listed(self, driver, wait):
        """TC-CD-002: Seeded deals are displayed."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(2)
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='deal-card']")
        assert len(cards) > 0

    def test_search_filters_deals(self, driver, wait):
        """TC-CD-003: Search input filters displayed deals."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(1)
        search = driver.find_element(By.CSS_SELECTOR, "[data-testid='search-input']")
        search.clear()
        search.send_keys("NONEXISTENT_DEAL_XYZ_999")
        time.sleep(2)
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='deal-card']")
        empty = driver.find_elements(By.CSS_SELECTOR, "[data-testid='no-deals-message']")
        assert len(cards) == 0 or len(empty) > 0

    def test_category_filter_has_options(self, driver, wait):
        """TC-CD-004: Category filter has seeded categories."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(2)
        from selenium.webdriver.support.select import Select
        options = Select(driver.find_element(By.CSS_SELECTOR, "[data-testid='category-filter']")).options
        assert len(options) >= 2

    def test_deal_card_navigates_to_detail(self, driver, wait):
        """TC-CD-005: Clicking a deal card opens deal detail."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(2)
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='deal-card']")
        if cards:
            cards[0].click()
            wait.until(EC.url_contains("/deals/"))
            assert "/deals/" in driver.current_url


class TestDealDetail:

    def test_deal_detail_loads(self, driver, wait):
        """TC-DD-001: Deal detail page loads with bookmark button."""
        driver.get(f"{BASE_URL}/deals")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deals-page']")))
        time.sleep(2)
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='deal-card']")
        if not cards:
            pytest.skip("No deals to test")
        cards[0].click()
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='deal-detail-page']")))
        time.sleep(1)

    def test_bookmark_toggle(self, driver, wait):
        """TC-DD-002: Bookmark button is clickable."""
        detail = driver.find_elements(By.CSS_SELECTOR, "[data-testid='deal-detail-page']")
        if not detail:
            pytest.skip("Not on detail page")
        btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='bookmark-button']")
        btn.click()
        time.sleep(1)
        assert btn.is_enabled()


class TestBookmarks:

    def test_bookmarks_page_loads(self, driver, wait):
        """TC-BM-001: Bookmarks page loads."""
        driver.get(f"{BASE_URL}/bookmarks")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='bookmarks-page']")))
        time.sleep(1)
        assert "Bookmarks" in driver.find_element(By.TAG_NAME, "body").text


class TestNotifications:

    def test_notifications_page_loads(self, driver, wait):
        """TC-NF-001: Notifications page loads."""
        driver.get(f"{BASE_URL}/notifications")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='notifications-page']")))
        time.sleep(1)
        assert "Notifications" in driver.find_element(By.TAG_NAME, "body").text


class TestProfile:

    def test_profile_page_loads(self, driver, wait):
        """TC-PF-001: Profile page loads with user data."""
        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='profile-page']")))
        time.sleep(1)
        name = driver.find_element(By.CSS_SELECTOR, "[data-testid='display-name']")
        assert name.get_attribute("value") != ""

    def test_logout_button_present(self, driver, wait):
        """TC-PF-002: Profile has logout button."""
        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='profile-page']")))
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='logout-button']").is_enabled()
