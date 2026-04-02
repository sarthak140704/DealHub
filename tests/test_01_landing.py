"""
Test Suite 01: Landing Page
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL


class TestLandingPage:

    def test_page_loads(self, driver, wait):
        """TC-LP-001: Landing page loads successfully."""
        driver.get(BASE_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='landing-page']")))
        assert "DealHub" in driver.title

    def test_navbar_has_auth_links(self, driver, wait):
        """TC-LP-002: Navbar has login and signup links."""
        driver.get(BASE_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='landing-page']")))
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-login']").get_attribute("href").endswith("/login")
        assert driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-register']").get_attribute("href").endswith("/register")

    def test_hero_cta_links_to_register(self, driver, wait):
        """TC-LP-003: Hero CTA button links to /register."""
        driver.get(BASE_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='landing-page']")))
        cta = driver.find_element(By.CSS_SELECTOR, "[data-testid='hero-cta']")
        assert cta.get_attribute("href").endswith("/register")

    def test_login_link_navigates(self, driver, wait):
        """TC-LP-004: Login link navigates to /login."""
        driver.get(BASE_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='landing-page']")))
        driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-login']").click()
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
