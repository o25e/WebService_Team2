import os
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup

# 크롬 드라이버 설정
base_dir = os.path.dirname(os.path.abspath(__file__))
driver_path = os.path.join(base_dir, 'chromedriver.exe')

options = Options()
options.add_experimental_option("detach", True)
service = Service(driver_path)
driver = webdriver.Chrome(service=service, options=options)

# 로그인
driver.get("https://account.everytime.kr/login")
time.sleep(1)
driver.find_element(By.NAME, "id").send_keys("")
driver.find_element(By.NAME, "password").send_keys("")
driver.find_element(By.CSS_SELECTOR, "form > input[type=submit]").click()
time.sleep(2)

# 동아리/학회 게시판 이동
driver.get("https://everytime.kr/418775")
time.sleep(2)

# '교내' 탭 클릭
driver.find_element(By.XPATH, "//span[text()='교내']").click()
time.sleep(2)

# 스크롤 내려 게시글 로딩 (필요 시)
for _ in range(5):
    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.END)
    time.sleep(1)

# 게시글 리스트 파싱
soup = BeautifulSoup(driver.page_source, "html.parser")
articles = soup.select("article.list > a.article")
post_links = ["https://everytime.kr" + a["href"] for a in articles]

detailed_club_info = []

for idx, link in enumerate(post_links, 1):
    driver.get(link)
    time.sleep(2)

    detail_soup = BeautifulSoup(driver.page_source, "html.parser")
    article = detail_soup.select_one("article.item")

    if not article:
        print(f"[{idx}] 게시글 구조를 찾을 수 없음: {link}")
        continue

    # 제목
    title_tag = article.select_one("h2.large")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # 본문 내용
    content_tag = article.select_one("p.large")
    content = content_tag.get_text(separator="\n", strip=True) if content_tag else ""

    # 모집 기간 추출
    모집기간 = ""
    기간_match = re.search(r'\d{1,2}/\d{1,2}\(.\) *~ *\d{1,2}/\d{1,2}\(.\)', content)
    if 기간_match:
        모집기간 = 기간_match.group()

    # 회비, 신청 방식, 구글폼 추출
    회비, 신청방식, 구글폼링크 = "", "", ""
    for line in content.split('\n'):
        if '회비' in line:
            회비 = line.split(':', 1)[-1].strip()
        elif '신청 방식' in line or '신청방법' in line:
            신청방식 = line.split(':', 1)[-1].strip()
        if 'forms.gle' in line or 'docs.google.com/forms' in line:
            for part in line.split():
                if 'forms.gle' in part or 'docs.google.com/forms' in part:
                    구글폼링크 = part.strip()

    # 이미지 링크 추출
    이미지링크 = ""
    img_div = article.select_one("div.attachthumbnail")
    if img_div and "background-image" in img_div.get("style", ""):
        이미지링크 = img_div["style"].split('url("')[1].split('")')[0]
    else:
        img_tag = article.select_one("img")
        if img_tag and img_tag.get("src"):
            이미지링크 = img_tag["src"]

    detailed_club_info.append({
        "제목": title,
        "활동 내용": content,
        "모집 기간": 모집기간,
        "회비": 회비,
        "신청 방식": 신청방식,
        "구글폼 링크": 구글폼링크,
        "이미지 링크": 이미지링크,
        "게시글 링크": link
    })

    print(f"[{idx}]")
    print(f"제목: {title}")
    print(f"활동 내용: {content}")
    print("------------------------------------------------------------------------------")
    print(f"모집 기간: {모집기간}")
    print(f"회비: {회비}")
    print(f"신청 방식: {신청방식}")
    print(f"구글폼 링크: {구글폼링크}")
    print(f"이미지 링크: {이미지링크}")
    print(f"게시글 링크: {link}")
    print("----\n")

driver.quit()

# python src/features/clubCrawler/everytime_crolling.py