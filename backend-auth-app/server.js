const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 루트 응답 (Render 배포 확인용)
app.get("/", (req, res) => {
  res.send("✅ 백엔드 서버가 정상 작동 중입니다!");
});

// 라우터
app.use('/api/auth', authRoutes);

// 포트 설정: Render 환경에선 process.env.PORT, 로컬은 5000
const PORT = process.env.PORT || 5000;

// DB 연결 후 서버 실행
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    app.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB 연결 실패', err));
