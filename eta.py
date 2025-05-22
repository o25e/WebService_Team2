from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

# ✅ 크롬 드라이버 경로 설정
chrome_driver_path = r"C:\Users\82103\OneDrive\바탕 화면\크롤링\chromedriver-win64\chromedriver-win64\chromedriver.exe"  # <-- 너 컴퓨터에 맞게 수정

# ✅ 옵션 설정 (브라우저 창 안뜨게 하고 싶으면 headless 추가 가능)
options = Options()
options.add_argument("--start-maximized")
# options.add_argument("--headless")

# ✅ 드라이버 실행
driver = webdriver.Chrome(service=Service(chrome_driver_path), options=options)

# ✅ 1. 에브리타임 로그인 페이지 접속
driver.get("https://everytime.kr/login")
time.sleep(2)

# ✅ 2. 로그인
your_id = "kimnarin2004"
your_pw = "kimnarin1234!"

driver.find_element(By.NAME, "id").send_keys(your_id)
driver.find_element(By.NAME, "password").send_keys(your_pw)
driver.find_element(By.NAME, "password").submit()

time.sleep(3)

# ✅ 3. 동아리·학회 게시판 이동 (학교별로 다르니 확인 필요!)
club_board_url = "https://everytime.kr/418775"  # 정확한 URL로 바꿔
driver.get(club_board_url)
time.sleep(3)

# ✅ 4. 게시글 목록 가져오기
posts = driver.find_elements(By.CSS_SELECTOR, ".article")

print("\n📌 최근 게시글 목록:")
for post in posts:
    try:
        title = post.find_element(By.CLASS_NAME, "title").text
        preview = post.find_element(By.CLASS_NAME, "body").text
        print(f"제목: {title}")
        print(f"내용 미리보기: {preview}\n")
    except:
        continue

# ✅ 5. 종료
driver.quit()
