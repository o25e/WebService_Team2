// 몽고 DB 접속 코드
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
//const url = 'mongodb+srv://sangho:1016@cluster0.xwq0xe8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const url = 'mongodb+srv://eeeon:0915@cluster0.oz5ftkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
//const url = 'mongodb+srv://kimnarin572:0000@cluster0.sn9kshr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let mydb;
mongoclient.connect(url)
.then(client => {
    mydb = client.db('dongaring_db'); // 데이터베이스 이름
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
// // 세션 생성
// let session = require('express-session');
// app.use(session({
//     secret : 'b34m352jo2nfosd',
//     resave : false,
//     saveUninitialized : true
// }));
// // 쿠키 라우터
// let cookieParser = require('cookie-parser');
// app.use(cookieParser());
// app.get('/cookie', function(req, res){
//     // 예시
//     res.cookie('milk', '1000원');
//     res.send('product : '+req.cookies.milk);
// });

// 정적 파일 라이브러리 추가
app.use(express.static("public"));
// src도 추가 
// src 안의 파일은 "/styles/main.css"처럼 src 빼고 경로 적으면 됨.
const path = require('path');
app.use(express.static(path.join(__dirname, 'src')));

// 소개 페이지 라우팅
app.get('/aboutus', function (req, res) {
    res.render("aboutus.ejs");
});

// 메인 페이지 라우팅
app.get('/main', function (req, res) {
    res.render("main.ejs");
});

// 로그인 페이지 라우팅
app.get('/login', function (req, res) {
    res.render("login.ejs");
});

// 등록 페이지 라우팅
app.get('/register', function (req, res) {
    res.render("register.ejs");
});

// 알림 페이지 라우팅
app.get('/notifications', function (req, res) {
    res.render("notifications.ejs");
});

// 동아리 페이지 라우팅
app.get('/club', function (req, res) {
    res.render("club.ejs");
});
app.get('/club/data', function (req, res) {
    mydb
    .collection('club_post')
    .find().toArray().then(result=>{
        res.json(result);
    }).catch((err)=>{
        console.log(err);
    });
});

// 소모임 페이지 라우팅
app.get('/smclub', function (req, res) {
    res.render("smclub.ejs");
});

// 기타 페이지 라우팅
app.get('/etcclub', function (req, res) {
    res.render("etcclub.ejs");
});

// 글쓰기 페이지 라우팅
app.get('/enter', function (req, res){
    const selected = req.query.selected || '';
    console.log(selected);
    res.render("enter.ejs", {selected: selected});
});

// 글쓰기 요청
app.post('/save', function (req, res){
    console.log("==================");
    console.log(req.body.clubType);
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.category);
    console.log(req.body.deadline);
    console.log(req.body.image);
    console.log("");
    // mongoDB
    mydb.collection(req.body.clubType).insertOne(
        {
            title : req.body.title,
            content : req.body.content,
            category : req.body.category,
            deadline : req.body.deadline,
            image : req.body.image
        }
    ).then(result => {
        console.log(result);
        console.log("데이터 추가 성공")
    });
    const redirect_page = req.body.clubType.replace('_post', '');
    res.redirect("/"+redirect_page);
});