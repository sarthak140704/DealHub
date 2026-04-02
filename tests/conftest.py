"""
DealHub Selenium Test Configuration
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:3000"

CUSTOMER_EMAIL = "john@example.com"
CUSTOMER_PASSWORD = "password123"
VENDOR_EMAIL = "vendor1@dealhub.com"
VENDOR_PASSWORD = "password123"
ADMIN_EMAIL = "admin@dealhub.com"
ADMIN_PASSWORD = "password123"


@pytest.fixture(scope="module")
def driver():
    options = Options()
    # Comment out the next line if you want to SEE the browser while testing
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    service = Service(ChromeDriverManager().install())
    d = webdriver.Chrome(service=service, options=options)
    d.implicitly_wait(3)
    yield d
    d.quit()


@pytest.fixture(scope="module")
def wait(driver):
    return WebDriverWait(driver, 10)


def login_as(driver, wait, email, password):
    """Log in with given credentials. Robust: resets state fully."""
    driver.get("about:blank")
    driver.delete_all_cookies()
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)

    # Retry up to 3 times if login form hasn't rendered
    for attempt in range(3):
        inputs = driver.find_elements(By.ID, "email")
        if inputs and inputs[0].is_displayed():
            break
        time.sleep(2)
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)

    email_input = driver.find_element(By.ID, "email")
    email_input.clear()
    email_input.send_keys(email)

    password_input = driver.find_element(By.ID, "password")
    password_input.clear()
    password_input.send_keys(password)

    driver.find_element(By.CSS_SELECTOR, "[data-testid='login-button']").click()
    time.sleep(3)


def logout(driver, wait):
    driver.get("about:blank")
    driver.delete_all_cookies()
    time.sleep(1)
