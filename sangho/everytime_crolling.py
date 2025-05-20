# 에타 크롤링
import requests
from bs4 import BeautifulSoup

# 사람인 척하는 헤더
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
# 스크래핑할 주소와 헤더 입력해서 데이터 가져오기
data = requests.get('https://everytime.kr/418775', headers=headers)
# data.text는 html 원문
soup = BeautifulSoup(data.text, 'html.parser')
# 공통 요소 찾기
elems = soup.select('#container > div.wrap.articles > article > a > div')

print(elems)

for elem in elems :
    title = elem.select_one('h2')
    
    if title is not None:
        print(title, end=" ")
        
    content = elem.select_one('p')
    
    if content is not None:
        print(content)


#container > div.wrap.articles > article:nth-child(2) > a > div > h2
#container > div.wrap.articles > article:nth-child(2) > a > div > p

#container > div.wrap.articles > article:nth-child(3) > a > div.desc > h2