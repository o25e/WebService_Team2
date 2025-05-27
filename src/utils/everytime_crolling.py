import os
import time
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
driver.find_element(By.NAME, "id").send_keys("eeeon")
driver.find_element(By.NAME, "password").send_keys("Julliet0915!")
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
    time.sleep(2)  # 페이지 로딩 대기

    detail_soup = BeautifulSoup(driver.page_source, "html.parser")

    # 상세 제목 (대개 h2.medium.bold)
    title_tag = detail_soup.select_one("article.view h2.medium.bold")
    title = title_tag.text.strip() if title_tag else ""

    # 상세 내용 (대개 article.view 내 p.medium 또는 div.description 등)
    content_tag = detail_soup.select_one("article.view > p.medium")
    content = content_tag.text.strip() if content_tag else ""

    # 모집 기간, 회비, 신청 방식 등은 보통 내용 중에 텍스트 형태로 있음
    # 예를 들어, 내용에서 '모집 기간:', '회비:', '신청 방식:' 등의 키워드로 파싱 시도
    모집기간 = ""
    회비 = ""
    신청방식 = ""
    구글폼링크 = ""
    이미지링크 = ""

    # 내용 내 줄 단위로 나누어 파싱 (키워드 기반)
    if content:
        lines = content.split('\n')
        for line in lines:
            if '모집 기간' in line:
                모집기간 = line.split(':', 1)[-1].strip()
            elif '회비' in line:
                회비 = line.split(':', 1)[-1].strip()
            elif '신청 방식' in line or '신청방법' in line:
                신청방식 = line.split(':', 1)[-1].strip()
            if 'docs.google.com/forms' in line or 'forms.gle' in line:
                # 구글폼 링크가 텍스트로 있으면 추출
                parts = line.split()
                for part in parts:
                    if 'docs.google.com/forms' in part or 'forms.gle' in part:
                        구글폼링크 = part.strip()

    # 이미지 URL 추출 (article.view 내 div.attachthumbnail 혹은 img 태그)
    img_div = detail_soup.select_one("article.view div.attachthumbnail")
    if img_div:
        style = img_div.get("style", "")
        if "background-image" in style:
            이미지링크 = style.split('url("')[1].split('")')[0]
    else:
        # img 태그가 있을 경우
        img_tag = detail_soup.select_one("article.view img")
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

    print(f"[{idx}] {title}")
    print(f"모집 기간: {모집기간}")
    print(f"회비: {회비}")
    print(f"신청 방식: {신청방식}")
    print(f"구글폼 링크: {구글폼링크}")
    print(f"이미지 링크: {이미지링크}")
    print(f"게시글 링크: {link}")
    print("----\n")

driver.quit()

# python src/utils/everytime_crolling.py