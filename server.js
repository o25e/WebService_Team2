// 몽고 DB 접속 코드
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = 'mongodb+srv://sangho:1016@cluster0.xwq0xe8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let mydb;
mongoclient.connect(url)
.then(client => {
    mydb = client.db('myboard');
    // mydb.collection('post').find().toArray().then(result => {
    //     console.log(result);
    // });

    app.listen(8080, function () {
        console.log("포트 8080으로 서버 대기중...")
    });
}).catch(err => {
    console.log(err);
});

// 서버
const express = require('express');
const app = express();

// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// 쿠키 라우터
let cookieParser = require('cookie-parser');
app.use(cookieParser());
app.get('/cookie', function(req, res){
    // 예시
    res.cookie('milk', '1000원');
    res.send('product : '+req.cookies.milk);
});

// 정적 파일 라이브러리 추가
app.use(express.static("public"));
// src도 추가 
// src 안의 파일은 "/styles/main.css"처럼 src 빼고 경로 적으면 됨.
const path = require('path');
app.use(express.static(path.join(__dirname, 'src')));

// 소개 페이지 요청
app.get('/', function (req, res) {
    res.render("aboutus.ejs");
});

// 메인 페이지
app.get('/main', function (req, res) {
    res.render("main.ejs");
});

// 로그인 페이지 요청
app.get('/login', function (req, res) {
    res.render("login.ejs");
});

// 등록 페이지 요청
app.get('/register', function (req, res) {
    res.render("register.ejs");
});

// 소모임 페이지 요청
app.get('/small-club', function (req, res) {
    res.render("small-club.ejs");
});

// 소모임 페이지 요청
app.get('/etc-club', function (req, res) {
    res.render("etc-club.ejs");
});