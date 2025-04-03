import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import memoRoutes from './routes/memo.js';
import userRouter from './routes/user.js';
import groupRouter from './routes/group.js';
import path from 'path';

dotenv.config(); // 환경 변수 로드

const app = express(); // 먼저 선언

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터 연결 (이제 오류 없음)
app.use('/api/memos', memoRoutes);
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);

// 서버에서 uploads 정적 폴더 제공
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// 서버 실행
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
