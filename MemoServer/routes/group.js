import express from 'express';
import db from '../db.js';

const router = express.Router();

// 1. 사용자별 그룹 목록 조회
router.get('/:user_idx_t', async (req, res) => {
    const user_idx = req.params.user_idx_t;

    try {
        const [rows] = await db.query('SELECT idx, group_name FROM group_t WHERE user_idx_t = ? ORDER BY idx DESC', [
            user_idx,
        ]);
        res.json(rows);
    } catch (err) {
        console.error('그룹 목록 조회 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. 그룹 생성
router.post('/', async (req, res) => {
    const { group_name, user_idx_t } = req.body;

    if (!group_name || !user_idx_t) {
        return res.status(400).json({ error: 'group_name과 user_idx_t는 필수입니다.' });
    }

    try {
        const [result] = await db.query('INSERT INTO group_t (group_name, user_idx_t) VALUES (?, ?)', [
            group_name,
            user_idx_t,
        ]);
        res.status(201).json({ insertedId: result.insertId });
    } catch (err) {
        console.error('그룹 생성 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. 그룹 이름 수정
router.put('/:id', async (req, res) => {
    const group_id = req.params.id;
    const { group_name } = req.body;

    if (!group_name) {
        return res.status(400).json({ error: 'group_name은 필수입니다.' });
    }

    try {
        const [result] = await db.query('UPDATE group_t SET group_name = ? WHERE idx = ?', [group_name, group_id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        console.error('그룹 수정 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. 그룹 삭제
router.delete('/:id', async (req, res) => {
    const group_id = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM group_t WHERE idx = ?', [group_id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        console.error('그룹 삭제 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
