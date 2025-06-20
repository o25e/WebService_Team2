// 서버
const express = require('express');
const app = express();

// JSON 파싱을 위한 미들웨어
app.use(express.json());
// 폼 데이터 파싱을 위한 미들웨어 (선택)
app.use(express.urlencoded({ extended: true }));

// 알림
const cron = require('node-cron');
const moment = require('moment');
const { ObjectId } = require('mongodb');

// 알림 조회 API
app.get('/api/notifications', async (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: "studentId 없음" });
  }

  try {
    const notis = await mydb.collection('notifications')
      .find({ userStudentId: studentId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(notis);
  } catch (err) {
    console.error("알림 조회 오류:", err);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});


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

const dotenv = require('dotenv').config();
// 몽고 DB 접속 코드
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL; // 환경변수 사용
//  const url = 'mongodb+srv://eeeon:0915@cluster0.oz5ftkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
//const url = 'mongodb+srv://kimnarin572:0000@cluster0.sn9kshr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let mydb;
mongoclient.connect(url)
  .then(client => {
    mydb = client.db('dongaring_db'); // 데이터베이스 이름
    // mydb.collection('post').find().toArray().then(result => {
    //     console.log(result);
    // });

    app.listen(process.env.PORT, function () {
      console.log("포트 8080으로 서버 대기중...")
    });
  }).catch(err => {
    console.log(err);
  });



// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

app.get("/", function (req, res){
    console.log("user : null");
    res.render("home.ejs", { user: null });
});

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
app.get('/notifications', async (req, res) => {
  const studentId = req.query.studentId;
  if (!studentId) {
    return res.status(400).json({ error: "studentId 없음" });
  }

  const notis = await mydb.collection('notifications')
    .find({ userStudentId: studentId })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(notis);
});
const collectionName = 'notification';

cron.schedule('* * * * *', async () => {
  console.log("              [CRON] 북마크 마감 알림 스캔 시작");

  const users = await mydb.collection('user').find().toArray();

  for (const user of users) {
    console.log(`사용자: ${user.studentId}`);
    const bookmarks = user.bookmarkList || [];

    for (const postId of bookmarks) {
      let post = null;
      const postCollections = ['club_post', 'etcclub_post', 'smclub'];

      for (const col of postCollections) {
        try {
          post = await mydb.collection(col).findOne({ _id: new ObjectId(postId) });
          if (post) {
            console.log(`✔️ ${col}에서 ${post.title} 찾음`);
            if(col !== 'smclub')
              post._postType = col.replace('_post', '');
            else
              post._postType = col;
            break;
          }
        } catch (err) {
          console.log(`❌ ${col}에서 postId 변환 실패:`, postId);
        }
      }
      
      if (!post) {
        console.log(`❌ 게시글 없음`);
        continue;
      }
      // post가 소모임인 경우
      if (post._postType === 'smclub'){
        console.log("함수실행");
        smclubNotification(post, user);
        continue;
      }
      if (!post.deadline) {
        console.log(`❌ 마감일 없음`);
        continue;
      }
      
      const deadline = moment(post.deadline).startOf('day');
      const today = moment().startOf('day');
      const dday = deadline.diff(today, 'days');

      console.log(`📝 ${post.title}, 마감일: ${post.deadline}, D-${dday}`);

      // ✅ D-1, D-3, D-5일일 때만 알림
      const allowedDays = [1, 3, 5];

      if (allowedDays.includes(dday)) {
        const msg = `[${post.title}]의 마감일이 D-${dday}입니다.`;

        const exists = await mydb.collection('notifications').findOne({
          userStudentId: user.studentId,
          message: msg
        });

        if (!exists) {
          await mydb.collection('notifications').insertOne({
            userStudentId: user.studentId,
            message: msg,
            postId: post._id,
            postType: post._postType,
            isRead: false,
            createdAt: new Date()
          });
          console.log("✅ 알림 추가됨:", msg);
        } else {
          console.log("⚠️ 이미 동일한 알림 존재");
        }
      }
    }
  }
});
//  함수
async function smclubNotification(smclub, user) {
  const posts = await mydb.collection("smclub_post").find({ smclubId: smclub._id }).toArray();
  if(!posts ){
    console.log("❌ 해당 소모임 포스트들 못 찾음");
    return;
  };

  for (const post of posts){
    if (!post || !post.deadline) {
        console.log(`❌ 게시글 없음 or 마감일 없음`);
        continue;
      }
      
      const deadline = moment(post.deadline).startOf('day');
      const today = moment().startOf('day');
      const dday = deadline.diff(today, 'days');

      console.log(`📝 ${post.title}, 마감일: ${post.deadline}, D-${dday}`);

      // ✅ D-1, D-3, D-5일일 때만 알림
      const allowedDays = [1, 3, 5];

      if (allowedDays.includes(dday)) {
        const msg = `[${post.title}]의 마감일이 D-${dday}입니다.`;

        const exists = await mydb.collection('notifications').findOne({
          userStudentId: user.studentId,
          message: msg
        });

        if (!exists) {
          await mydb.collection('notifications').insertOne({
            userStudentId: user.studentId,
            message: msg,
            postId: post._id,
            postType: "smclub",
            isRead: false,
            createdAt: new Date()
          });
          console.log("✅ 알림 추가됨:", msg);
        } else {
          console.log("⚠️ 이미 동일한 알림 존재");
        }
      }
  }
}

app.get('/api/unread-count', async (req, res) => {
  const studentId = req.query.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId 없음" });

  try {
    const count = await mydb.collection('notifications')
      .countDocuments({ userStudentId: studentId, isRead: false });
    res.json({ count });
  } catch (err) {
    console.error("알림 수 조회 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

app.post('/api/mark-read', async (req, res) => {
  const { studentId, message } = req.body;
  await mydb.collection('notifications').updateOne(
    { userStudentId: studentId, message },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});

app.patch('/api/notifications/markAsRead', async (req, res) => {
  const { studentId, postId } = req.body;

  if (!studentId || !postId) {
    return res.status(400).json({ error: "필수 정보 누락" });
  }

  try {
    await mydb.collection('notifications').updateOne(
      {
        userStudentId: studentId,
        postId: new ObjectId(postId) 
      },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "읽음 처리 완료" });
  } catch (err) {
    console.error("읽음 처리 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 동아리 페이지 라우팅
app.get("/club", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const collection = mydb.collection("club_post");
    const totalPosts = await collection.countDocuments({ clubType: "club_post" });
    const totalPages = Math.ceil(totalPosts / limit);

    res.render("club", {
      currentPage: page,
      totalPages: totalPages
    });
  } catch (err) {
    console.error("클럽 페이지 로딩 중 오류 발생:", err);
    res.status(500).send("페이지 로딩 오류");
  }
});
app.get("/api/clubPosts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const db = mydb;
    const collection = db.collection("club_post");

    const totalPosts = await collection.countDocuments({ clubType: "club_post" });
    const posts = await collection.find({ clubType: "club_post" })
                                  .sort({ createdAt: -1 })
                                  .skip(skip)
                                  .limit(limit)
                                  .toArray();

    const totalPages = Math.ceil(totalPosts / limit);
    res.json({ posts, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 에러");
  }
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

// 유저 북마크 리스트 보내기
app.get('/bookmarkList', function (req, res) {
  mydb
    .collection('user')
    .findOne({ studentId: req.query.studentId })
    .then(result => {
      res.json(result.bookmarkList);
    }).catch((err) => {
      console.log(err);
    });
});
// 북마크 추가, 제거
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
  mydb.collection("smclub").find().toArray().then(smclubs=>{
    const smclubNames = smclubs.map(smclub => smclub.title);
    res.render("smclub.ejs", {smclubNames});
  }).catch((err)=>{
    console.log("소모임 이름 가져오기 오류", err);
    res.status(500).send("서버 오류");
  });
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
    console.log(req.file);
    // 이미지 경로
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
      writer: req.body.writer, // 작성자
      clubType: req.body.clubType, // 글 종류
    }
    // smclub_post인 경우 데이터에 smclubId 추가
    let smclub = {};
    if (req.body.clubType === "smclub_post") {
      // smclubId에 해당 소모임 _id 저장
      smclub = await mydb.collection("smclub").findOne({ title: req.body.smclubName })
      postData.smclubId = smclub._id;
      postData.postType = "smclub_post";
    }
    // mongoDB에 저장
    const savedData = await mydb.collection(req.body.clubType).insertOne(postData)
    if(savedData){
      console.log(savedData.insertedId);
      console.log("데이터 추가 성공")
    } else {
      console.log("데이터 저장 실패")
    }
    // 사용자 정보에 작성 리스트 추가
    const writer = await mydb.collection("user").findOne({ studentId: req.body.writer });
    const writeList = writer.writeList? writer.writeList : [];
    writeList.push(savedData.insertedId.toString());
    await mydb.collection("user").updateOne({studentId: req.body.writer}, {$set: { writeList: writeList }});
    // smclub_post인 경우 
    if (req.body.clubType === "smclub_post"){
      // 북마크 해당 user에게 알림 추가
      console.log("!!!!!!!!!!!!! 새 글 북마크 추가 시작")
      const users = await mydb.collection('user').find().toArray();
      for (const user of users) {
        console.log(`사용자: ${user.studentId}`);
        const bookmarks = user.bookmarkList || [];
        const msg = `${smclub.title}에 새 글이 올라왔습니다.`
        if(bookmarks.includes(smclub._id.toString())){
          await mydb.collection('notifications').insertOne({
            userStudentId: user.studentId,
            message: msg,
            postId: savedData.insertedId,
            postType: "smclub",
            isRead: false,
            createdAt: new Date()
          });
          console.log("✅ 알림 추가됨:", msg);
        } else {
          console.log("북마크에 포함 안됨");
        }
      }
    }
    // 동아리 목록으로 돌아가기
    const redirect_page = req.body.clubType.replace('_post', '');
    res.redirect("/" + redirect_page);

  } catch(err){
    console.log("글 저장 실패", err);
    res.status(500).send("서버 에러");
  }
});

// 글 삭제
app.post("/delete", function(req, res){
  const deleteId = new ObjId(req.body._id);
  mydb.collection(req.body.clubType + "_post")
  .deleteOne({_id: deleteId}).then(result=>{
    console.log("삭제 완료");
    res.status(200).json({message: "삭제 성공"});
  });
});

// 글 수정
app.get("/edit/:id", async function(req, res){
  const smclubs = await mydb.collection("smclub").find().toArray(); // 소모임들
  
  const smclubNames = smclubs.map(elem => elem.title);
  const editId = new ObjId(req.params.id);
  const clubType = req.query.type;
  const renderData = { clubType: clubType, smclubNames: smclubNames }; // 보낼 데이터
  // 소모임 글이라면
  if (req.query.type === "smclub"){
    const smclubPost = await mydb.collection("smclub_post").findOne({ _id : editId }); // 해당 소모임 포스트
    const smclubName = smclubs.find(smclub => smclub._id.toString() === smclubPost.smclubId.toString()).title;
    renderData.smclub = smclubName;
  }
  mydb.collection(clubType + "_post")
  .findOne({_id: editId}).then((result)=>{
    res.render("edit.ejs", { ...renderData, post: result });
  });
});
// 글 수정 처리
app.post("/edit", upload.single('image'), async function(req, res){
  setData = {
    clubType: req.body.clubType,
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    deadline: req.body.deadline,
  }
  if(req.file){
    const imagePath = req.file ? '/uploads/' + req.file.filename : originalImage;
    setData.image = imagePath;
  }
  if(req.body.clubType === "smclub_post"){
    setData.smclubName = req.body.smclubName;
    const smclub = await mydb.collection("smclub").findOne({title: req.body.smclubName});
    setData.smclubId = smclub._id;
  }
  mydb.collection(req.body.clubType)
  .updateOne({ _id: new ObjId(req.body._id) }, {$set: setData})
  .then(result=>{
    console.log(result, "데이터 수정 완료");
    res.redirect(`/content/${req.body._id}?type=${req.body.clubType.replace("_post", '')}`);
  })
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
// 북마크한 글 데이터 보내기
app.get("/club/data/bookmarked_club_post", async (req, res) => {
  try {
    const studentId = req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const user = await mydb.collection("user").findOne({ studentId });

    if (!user || !user.bookmarkList || user.bookmarkList.length === 0) {
      return res.json([]);
    }

    const collections = ["club_post", "smclub_post", "etcclub_post"];
    const objectIdList = user.bookmarkList.map(id => new ObjId(id));

    let bookmarkedPosts = [];

    for (const col of collections) {
      const posts = await mydb.collection(col)
        .find({ _id: { $in: objectIdList } })
        .toArray();

      // 컬렉션명에 따른 category 부여
      const category = col === "club_post" ? "club"
                     : col === "smclub_post" ? "smclub"
                     : "etcclub";

      const postsWithCategory = posts.map(post => ({ ...post, category }));

      bookmarkedPosts = bookmarkedPosts.concat(postsWithCategory);
    }

    res.json(bookmarkedPosts);
  } catch (err) {
    console.error("북마크 게시물 조회 오류:", err);
    res.status(500).send("서버 오류");
  }
});
// 유저 글 작성 리스트 보내기
app.get('/writeList', async function (req, res) {
  try {
    const studentId = req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const user = await mydb.collection("user").findOne({ studentId });

    if (!user || !user.writeList || user.writeList.length === 0) {
      return res.json([]);
    }

    const collections = ["club_post", "smclub_post", "etcclub_post"];
    const objectIdList = user.writeList.map(id => new ObjId(id));

    let bookmarkedPosts = [];

    for (const col of collections) {
      const posts = await mydb.collection(col)
        .find({ _id: { $in: objectIdList } })
        .toArray();

      // 컬렉션명에 따른 category 부여
      const category = col === "club_post" ? "club"
                     : col === "smclub_post" ? "smclub"
                     : "etcclub";

      const postsWithCategory = posts.map(post => ({ ...post, category }));

      bookmarkedPosts = bookmarkedPosts.concat(postsWithCategory);
    }

    res.json(bookmarkedPosts);
  } catch (err) {
    console.error("북마크 게시물 조회 오류:", err);
    res.status(500).send("서버 오류");
  }
});

// 모집 글 상세 페이지 라우팅
app.get('/content/:id', function (req, res) {
  // collection 선택
  const collection = req.query.type + "_post";
  const targetId = new ObjId(req.params.id);
  mydb
    .collection(collection)
    .findOne({ _id: targetId })
    .then((result) => {
      if(!result)
        return res.status(404).send("해당 글을 찾을 수 없습니다.");
      res.render("content.ejs", { post: result });
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send("서버 오류");
    });
});
// 소모임 정보 페이지 라우팅
app.get('/smclubInfo/:id', function (req, res) {
  let smclubData;
  const targetId = new ObjId(req.params.id);
  mydb
    .collection("smclub")
    .findOne({ _id: targetId })
    .then((result) => {
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

const sha = require('sha256');
const { hash } = require('crypto');

// 회원가입 처리 라우터
app.post('/register', async (req, res) => {
  const { studentId, password, email } = req.body;

  try {
    const exists = await mydb.collection('user').findOne({ studentId });
    if (exists) {
      return res.status(400).json({ message: '이미 존재하는 학번입니다.' });
    }

    // 비밀번호 암호화
    const hashedPassword = sha(password);

    const newUser = {
      studentId,
      password: hashedPassword, // 필요 시 해시 처리 가능
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

    const hashedPassword = sha(password);
    if (user.password !== hashedPassword) {
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
