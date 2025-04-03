import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { user_id, user_pw, nickname } = req.body;

    if (!user_id || !user_pw) {
        return res.status(400).json({ error: '아이디와 비밀번호는 필수입니다.' });
    }

    try {
        const sql = `
            INSERT INTO user_t (user_id, user_pw, nickname)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.query(sql, [user_id, user_pw, nickname || '']);
        res.json({ success: true, user_idx: result.insertId });
    } catch (err) {
        console.error('회원가입 실패:', err);
        res.status(500).json({ error: '회원가입 실패' });
    }
});

router.post('/login', async (req, res) => {
    const { user_id, user_pw } = req.body;

    try {
        const sql = `
            SELECT * FROM user_t WHERE user_id = ? AND user_pw = ?
        `;
        const [rows] = await db.query(sql, [user_id, user_pw]);

        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        res.status(500).json({ error: '로그인 실패' });
    }
});

export default router;
