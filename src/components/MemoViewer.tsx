// src/components/MemoViewer.tsx
type MemoViewerProps = {
    title: string;
    content: string;
    onClose: () => void;
};

export default function MemoViewer({ title, content, onClose }: MemoViewerProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[60vw] h-[80vh] rounded shadow-lg p-6 relative flex flex-col">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500">
                    ✖
                </button>

                {/* 제목 */}
                <h2 className="text-3xl font-bold mb-4 break-words">{title}</h2>

                <hr className="mb-4" />

                {/* 본문 */}
                <div className="flex-1 overflow-auto text-lg whitespace-pre-wrap">
                    {content || <span className="text-gray-400">내용이 없습니다.</span>}
                </div>
            </div>
        </div>
    );
}
