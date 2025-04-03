import express from 'express';
import db from '../db.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 이미지 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${Date.now()}${ext}`);
    },
});
const upload = multer({ storage });

// 파일 삭제 유틸
const deleteImageFile = (urlPath) => {
    if (!urlPath) return;
    const filepath = path.join('uploads', path.basename(urlPath));
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
};

// 사용자 메모 전체 조회
router.get('/:user_idx_t', async (req, res) => {
    const user_idx = req.params.user_idx_t;
    try {
        const [rows] = await db.query(
            `
            SELECT 
                m.idx, 
                m.title, 
                m.contents AS content,
                m.image_url,
                m.group_idx_t AS group_idx,
                g.group_name,
                m.is_pinned,
                m.pin_order,
                DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM memo_t m
            JOIN group_t g ON m.group_idx_t = g.idx
            WHERE m.user_idx_t = ?
            ORDER BY m.is_pinned DESC, m.pin_order ASC, m.created_at DESC
        `,
            [user_idx]
        );
        res.json(rows);
    } catch (err) {
        console.error('메모 목록 조회 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 메모 수정
router.put('/:id', upload.single('image'), async (req, res) => {
    const memoId = req.params.id;
    const { title, contents, removeImage } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // 기존 이미지 경로 가져오기
        const [[memo]] = await db.query('SELECT image_url FROM memo_t WHERE idx = ?', [memoId]);

        let sql = 'UPDATE memo_t SET title = ?, contents = ?, updated_at = NOW()';
        const params = [title, contents];

        if (removeImage === 'true') {
            sql += ', image_url = NULL';
            deleteImageFile(memo.image_url); // 실제 파일 삭제
        } else if (imagePath) {
            sql += ', image_url = ?';
            params.push(imagePath);
            deleteImageFile(memo.image_url); // 기존 이미지 삭제 후 새 이미지 설정
        }

        sql += ' WHERE idx = ?';
        params.push(memoId);

        await db.query(sql, params);

        res.json({ success: true });
    } catch (err) {
        console.error('메모 수정 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 즐겨찾기 상태 변경
router.patch('/:id/pin', async (req, res) => {
    const memoId = req.params.id;
    const { is_pinned } = req.body;

    try {
        if (is_pinned) {
            const [maxResult] = await db.query('SELECT MAX(pin_order) AS max FROM memo_t');
            const newOrder = (maxResult[0].max || 0) + 1;

            await db.query(`UPDATE memo_t SET is_pinned = TRUE, pin_order = ? WHERE idx = ?`, [newOrder, memoId]);
        } else {
            await db.query(`UPDATE memo_t SET is_pinned = FALSE, pin_order = NULL WHERE idx = ?`, [memoId]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('즐겨찾기 변경 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

// 개별 메모 삭제
router.delete('/:id', async (req, res) => {
    const memoId = req.params.id;

    try {
        // 이미지 삭제
        const [[memo]] = await db.query('SELECT image_url FROM memo_t WHERE idx = ?', [memoId]);
        deleteImageFile(memo?.image_url);

        const [result] = await db.query('DELETE FROM memo_t WHERE idx = ?', [memoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
        }

        res.json({ message: '메모 삭제 성공' });
    } catch (err) {
        console.error('메모 삭제 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 전체 삭제 (그룹 기준)
router.delete('/group/:group_idx', async (req, res) => {
    const group_idx = req.params.group_idx;

    try {
        const [memos] = await db.query('SELECT image_url FROM memo_t WHERE group_idx_t = ?', [group_idx]);
        memos.forEach((memo) => deleteImageFile(memo.image_url));

        await db.query('DELETE FROM memo_t WHERE group_idx_t = ?', [group_idx]);

        res.json({ success: true });
    } catch (err) {
        console.error('전체 삭제 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 메모 생성
router.post('/', async (req, res) => {
    const { title, contents, group_idx_t, user_idx_t } = req.body;

    if (!title || !group_idx_t || !user_idx_t) {
        return res.status(400).json({ error: 'title, group_idx_t, user_idx_t는 필수입니다.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO memo_t (title, contents, group_idx_t, user_idx_t) VALUES (?, ?, ?, ?)`,
            [title, contents || '', group_idx_t, user_idx_t]
        );
        res.status(201).json({ insertedId: result.insertId });
    } catch (err) {
        console.error('메모 생성 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 이미지 업로드 API
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: '파일 없음' });

    res.json({
        success: true,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
    });
});

export default router;
