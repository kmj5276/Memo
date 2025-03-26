import { useState } from 'react';

type MemoEditorProps = {
    title: string;
    content: string;
    onClose: () => void;
    onSave: (newTitle: string, newContent: string) => void;
};

export default function MemoEditor({ title, content, onClose, onSave }: MemoEditorProps) {
    const [newTitle, setNewTitle] = useState(title);
    const [newContent, setNewContent] = useState(content);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[70%] h-[80vh] rounded shadow-lg p-8 relative flex flex-col">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500">
                    ✖
                </button>

                {/* 제목 입력 */}
                <input
                    className="text-3xl font-bold mb-4 outline-none border-b-2 pb-2"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="메모 제목을 입력하세요"
                />

                {/* 본문 입력 */}
                <textarea
                    className="flex-1 resize-none outline-none border rounded p-4 text-lg h-[50vh]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="메모 내용을 입력하세요"
                />

                {/* 저장 버튼 */}
                <button
                    onClick={() => onSave(newTitle, newContent)}
                    className="mt-6 py-3 bg-blue-500 text-white text-xl rounded hover:bg-blue-600"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
