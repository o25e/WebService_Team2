// 서버
const express = require('express');
const app = express();

// JSON 파싱을 위한 미들웨어
app.use(express.json());
// 폼 데이터 파싱을 위한 미들웨어 (선택)
app.use(express.urlencoded({ extended: true }));

//이미지 저장
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 이미지 저장 폴더
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

//이미지 업로드
app.use('/uploads', express.static('uploads'));
// 몽고 DB 접속 코드
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = 'mongodb+srv://sangho:1016@cluster0.xwq0xe8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// const url = 'mongodb+srv://eeeon:0915@cluster0.oz5ftkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
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

// 홈 페이지 라우팅
app.get('/home', function (req, res) {
  res.render("home.ejs");
});

// 메인 페이지 라우팅
app.get('/main', function (req, res) {
  res.render("main.ejs");
});

// 로그인 페이지 라우팅
app.get('/login', function (req, res) {
  res.render("login.ejs");
});

// 마이 페이지 라우팅
app.get('/mypage', function (req, res) {
  res.render("mypage.ejs");
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
  // user 정보 보기
  // mydb.collection('user').find().toArray().then(result=>{
  //   console.log(result);
  //   res.render("club.ejs");
  // });
  res.render("club.ejs");
});
// 소모임 데이터 요청 응답
app.get('/smclubData', function (req, res) {
  mydb
    .collection("smclub")
    .find().toArray().then(result => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
    });
});
// 포스트 데이터 요청 응답
app.get('/postData', function (req, res) {
  // 요청에 따라 콜렉션 종류 결정
  const collection = req.query.postType + "_post";
  mydb
    .collection(collection)
    .find().toArray().then(result => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
    });
});
app.get('/bookmarkList', function (req, res) {
  mydb
    .collection('user')
    .findOne({ studentId: req.query.studentId })
    .then(result => {
      res.json(result.bookmarkList);
    }).catch((err) => {
      console.log(err);
    });
  // 북마크 추가, 제거
})
app.post('/addBookmark', function (req, res) {
  console.log(req.body);
  req.body._id = new ObjId(req.body._id);
  // 요청에 따라 콜렉션 종류 결정
  const collection = req.query.type;
  // user 북마크리스트 업데이트
  mydb.collection('user')
    .updateOne({ studentId: req.body.studentId }, { $set: { bookmarkList: req.body.bookmarkList } })
    .then((result) => {
      console.log("추가: ", result.modifiedCount);
      console.log("북마크 추가 완료!");

      // 포스트의 북마크 개수 증가
      mydb.collection(collection)
        .updateOne({ _id: req.body._id }, { $inc: { bookmarkNum: 1 } })
        .then((result) => {
          console.log(req.body._id);
          console.log(result);
          console.log("북마크 수 증가!");
          res.json({ success: true });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ success: false, error: err.message });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    });
});
app.post('/deleteBookmark', function (req, res) {
  console.log(req.body);
  req.body._id = new ObjId(req.body._id);
  // 요청에 따라 콜렉션 종류 결정
  const collection = req.query.type;
  // user 북마크 리스트 업데이트
  mydb
    .collection('user')
    .updateOne({ studentId: req.body.studentId }, { $set: { bookmarkList: req.body.bookmarkList } })
    .then((result) => {
      console.log("제거: ", result.modifiedCount);
      console.log("북마크 제거 완료!");

      // 포스트의 북마크 개수 감소
      mydb.collection(collection)
        .updateOne({ _id: req.body._id }, { $inc: { bookmarkNum: -1 } })
        .then((result) => {
          console.log(result);
          console.log("북마크 수 감소!");
          res.json({ success: true });
        })
        .catch((err) => {
          res.send(500).send("서버 오류");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// 소모임 페이지 라우팅
app.get('/smclub', function (req, res) {
  res.render("smclub.ejs");
});
app.get('/enterSmclub', function (req, res) {
  res.render("enterSmclub.ejs");
});

// 기타 페이지 라우팅
app.get('/etcclub', function (req, res) {
  res.render("etcclub.ejs");
});

// 글쓰기 페이지 라우팅
app.get('/enter', function (req, res) {
  const selected = req.query.selected || '';
  mydb.collection("smclub").find().toArray().then((data) => {
    const smclubNames = data.map(elem => elem.title);
    res.render("enter.ejs", { selected: selected, smclubNames: smclubNames });
  });
});

// 글쓰기 저장
app.post('/save', upload.single('image'), async function (req, res) {
  try{
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';
    // 날짜
    const dateObj = new Date();
    // 구성 요소 추출 후 포맷
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formatted = `${year}.${month}.${day}`;
    // 글 데이터
    const postData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      deadline: req.body.deadline,
      image: imagePath,
      createdAt: dateObj,  // 등록한 날짜 추가
      createdDate: formatted, // 포맷 날짜
      bookmarkNum: 0, // 북마크 수
      hits: 0, // 조회수
    }
    // 소모임 이름에 해당하는 소모임 데이터 _id 저장
    if (req.body.clubType === "smclub_post") {
      await mydb.collection("smclub").findOne({ title: req.body.smclubName })
        .then((data) => {
          postData.smclubId = data._id;
        });
    }
    // mongoDB
    await mydb.collection(req.body.clubType)
      .insertOne(postData)
      .then(result => {
        console.log(result);
        console.log("데이터 추가 성공")
      });
    const redirect_page = req.body.clubType.replace('_post', '');
    res.redirect("/" + redirect_page);

  } catch(err){
    console.log("글 저장 실패", err);
    res.status(500).send("서버 에러");
  }
});

// home 글 정보 불러오기
app.get("/club/data/club_post", async (req, res) => {
  try {
    const data = await mydb.collection("club_post").find().toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

app.get("/club/data/smclub_post", async (req, res) => {
  try {
    const data = await mydb.collection("smclub_post").find().toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

app.get("/club/data/etcclub_post", async (req, res) => {
  try {
    const data = await mydb.collection("etcclub_post").find().toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

// 모집 글 상세 페이지 라우팅
app.get('/content/:id', function (req, res) {
  // collection 선택
  const collection = req.query.type + "_post";
  console.log(req.params.id);
  const targetId = new ObjId(req.params.id);
  mydb
    .collection(collection)
    .findOne({ _id: targetId })
    .then((result) => {
      console.log(result);
      res.render("content.ejs", { post: result });
    });
});
// 소모임 정보 페이지 라우팅
app.get('/smclubInfo/:id', function (req, res) {
  let smclubData;
  console.log(req.params.id);
  const targetId = new ObjId(req.params.id);
  mydb
    .collection("smclub")
    .findOne({ _id: targetId })
    .then((result) => {
      console.log(result);
      smclubData = result;
    }).then(() => {
      mydb.collection("smclub_post").find({ smclubId: targetId }).toArray().then((posts) => {
        posts.sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt));
        return posts;
      }).then(posts=>{  
        res.render("smclubInfo.ejs", { data: smclubData, posts: posts});
      });
    });
});

// 회원가입 처리 라우터
app.post('/register', async (req, res) => {
  const { studentId, password, email } = req.body;

  try {
    const exists = await mydb.collection('user').findOne({ studentId });
    if (exists) {
      return res.status(400).json({ message: '이미 존재하는 학번입니다.' });
    }

    const newUser = {
      studentId,
      password, // 필요 시 해시 처리 가능
      email,
      createdAt: new Date(),
      bookmarkList: [],
    };

    await mydb.collection('user').insertOne(newUser);
    res.status(200).json({ message: '회원가입 성공' });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인 처리 라우터
app.post('/login', async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const user = await mydb.collection('user').findOne({ studentId });

    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    res.status(200).json({
      message: '로그인 성공',
      user: {
        studentId: user.studentId,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});
