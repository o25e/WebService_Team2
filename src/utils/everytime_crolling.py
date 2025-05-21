# 에타 크롤링
import os
from bs4 import BeautifulSoup # 파싱
from selenium import webdriver # 크롤링
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

# 에브리타임 로그인 페이지 접속
url = 'https://account.everytime.kr/login'
base_dir = os.path.dirname(os.path.abspath(__file__))
driver_path = os.path.join(base_dir, 'chromedriver.exe')
service = Service(driver_path)
driver = webdriver.Chrome(service=service)
driver.get(url)
time.sleep(1)

# 아이디 입력
et_login = driver.find_element(By.NAME, "id")
et_login.clear()
et_login.send_keys('') # 아이디
# 비밀번호 입력
et_login = driver.find_element(By.NAME, "password")
et_login.clear()
et_login.send_keys('') # 비밀번호
# 로그인 버튼 클릭
driver.find_element(By.CSS_SELECTOR ,"body > div:nth-child(2) > div > form > input[type=submit]").click()
time.sleep(2)

# 동아리.학회 페이지 접속
driver.find_element(By.XPATH, '//*[@id="submenu"]/div/div[3]/ul/li[2]').click()
time.sleep(0.3)
# 교내 클릭
driver.find_element(By.CSS_SELECTOR, '#container > div.wrap.categories > div.category.selected > span').click()
