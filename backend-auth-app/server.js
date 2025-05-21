const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터
app.use('/api/auth', authRoutes);

// DB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB 연결 실패', err));
