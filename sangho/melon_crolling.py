# 멜론 top100 크롤링 예시
import requests
from bs4 import BeautifulSoup

# 사람인 척하는 헤더
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
# 스크래핑할 주소와 헤더 입력해서 데이터 가져오기
data = requests.get('https://www.melon.com/chart/', headers=headers)
# data.text는 html 원문
soup = BeautifulSoup(data.text, 'html.parser')
# 공통 요소 찾기
top_100 = soup.select('#lst50 > td > div')

for tr in top_100 :
    rank = tr.select_one('span.rank')
    
    if rank is not None:
        print(rank.text, end=" ")
        
    title = tr.select_one('div > div.ellipsis.rank01 > span > a')
    
    if title is not None:
        print(title.text)


#lst50 > td:nth-child(2) > div > span.rank
#lst50 > td:nth-child(6) > div > div > div.ellipsis.rank01 > span > a
#lst50 > td:nth-child(6) > div > div > div.ellipsis.rank01 > span > a
