import { useState } from 'react';

type HeaderProps = {
    onAddMemo: (title: string) => void;
    onClearAll: () => void;
};

export default function Header({ onAddMemo, onClearAll }: HeaderProps) {
    const [title, setTitle] = useState('');

    const handleAdd = () => {
        if (!title.trim()) return;
        onAddMemo(title);
        setTitle('');
    };

    return (
        <div className="flex items-center gap-6 mb-10">
            <input
                type="text"
                placeholder="New Memo"
                className="flex-1 border-2 rounded px-6 py-4 text-2xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={handleAdd} className="bg-blue-500 text-white px-6 py-4 rounded text-2xl">
                ＋
            </button>
            <button onClick={onClearAll} className="bg-red-500 text-white px-6 py-4 rounded text-2xl">
                🗑 전체 삭제
            </button>
        </div>
    );
}
