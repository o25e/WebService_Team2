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
articles = soup.select("article.item > a.article")

post_links = []
for a in articles:
    href = a.get("href")
    if href:
        full_link = "https://everytime.kr" + href
        post_links.append(full_link)

detailed_club_info = []

for idx, link in enumerate(post_links, 1):
    driver.get(link)
    time.sleep(2)  # 페이지 로딩 대기

    detail_soup = BeautifulSoup(driver.page_source, "html.parser")

    # 제목
    title_tag = detail_soup.select_one("article.view h2.medium.bold") or detail_soup.select_one("article.view h2.large")
    title = title_tag.text.strip() if title_tag else "제목없음"

    # 본문 내용 (p.large 기준)
    content_tag = detail_soup.select_one("article.view p.large")
    content_html = content_tag.decode_contents() if content_tag else ""
    content_text = content_tag.get_text(separator="\n").strip() if content_tag else ""

    모집기간 = ""
    회비 = ""
    신청방식 = ""
    구글폼링크 = ""
    이미지링크 = ""

    # <br> 기준으로 줄 분리 후 키워드 검색
    if content_html:
        lines = [line.strip() for line in content_html.split("<br>") if line.strip()]
        for line in lines:
            line_soup = BeautifulSoup(line, "html.parser")
            text_line = line_soup.get_text()

            # 키워드별 값 추출
            if "모집 기간" in text_line or "모집기간" in text_line:
                모집기간 = text_line.split(":", 1)[-1].strip()
            elif "회비" in text_line:
                회비 = text_line.split(":", 1)[-1].strip()
            elif "신청 방식" in text_line or "신청방법" in text_line:
                신청방식 = text_line.split(":", 1)[-1].strip()

            # 구글폼 링크 추출
            a_tag = line_soup.select_one("a[href*='docs.google.com/forms'], a[href*='forms.gle']")
            if a_tag:
                구글폼링크 = a_tag["href"]

    # 이미지 링크 추출
    img_tag = detail_soup.select_one("article.view div.attaches figure.attach img")
    if img_tag and img_tag.get("src"):
        이미지링크 = img_tag["src"]

    detailed_club_info.append({
        "제목": title,
        "활동 내용": content_text,
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
