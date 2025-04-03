import { useEffect, useState, useRef } from 'react';

type MemoEditorProps = {
    title: string;
    content: string;
    image_url?: string; // 전달된 기존 이미지 URL
    onClose: () => void;
    onSave: (newTitle: string, newContent: string, image?: File | null, removeImage?: boolean) => void;
};

export default function MemoEditor({
    title,
    content,
    image_url, // props에 추가
    onClose,
    onSave,
}: MemoEditorProps) {
    const [newTitle, setNewTitle] = useState(title);
    const [newContent, setNewContent] = useState(content);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageFilename, setImageFilename] = useState('');
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        // 컴포넌트 마운트 시 초기 파일명 설정
        if (image_url && !imageFilename) {
            const filename = image_url.split('/').pop() || '';
            setImageFilename(filename);
        }
    }, [image_url]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageFilename(file.name);
            setRemoveExistingImage(false); // 새 이미지 업로드 시 기존 이미지 삭제 안 함
        }
    };

    const handleRemoveImage = () => {
        const confirmed = window.confirm('첨부된 이미지를 삭제하시겠습니까?');
        if (confirmed) {
            setImageFile(null);
            setImageFilename(''); // 파일명 제거!
            setRemoveExistingImage(true); // 삭제 상태 반영
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[70%] h-[80vh] rounded shadow-lg p-8 relative flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500">
                    ✖
                </button>

                {/* 제목/내용 입력 */}
                <input
                    className="text-3xl font-bold mb-4 outline-none border-b-2 pb-2"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="메모 제목"
                />
                <textarea
                    className="flex-1 resize-none outline-none border rounded p-4 text-lg h-[50vh]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="메모 내용을 입력하세요"
                />

                <div className="flex items-center space-x-4 my-4">
                    <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer">
                        이미지 첨부
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setImageFile(file);
                                    setImageFilename(file.name);
                                    setRemoveExistingImage(false); // 새 이미지 첨부하면 기존 삭제 안 함
                                }
                            }}
                            className="hidden"
                        />
                    </label>

                    {/* 첨부된 이미지 파일명 + 삭제 버튼 (조건 명확히 나눔) */}
                    {imageFilename && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">{imageFilename}</span>
                            <button
                                className="text-red-500 font-bold text-xl hover:text-red-700"
                                onClick={() => {
                                    const confirmed = window.confirm('첨부된 이미지를 삭제하시겠습니까?');
                                    if (confirmed) {
                                        setImageFile(null);
                                        setImageFilename('');
                                        setPreview(null);
                                        setRemoveExistingImage(true);
                                    }
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onSave(newTitle, newContent, imageFile, removeExistingImage)}
                    className="mt-6 py-3 bg-blue-500 text-white text-xl rounded hover:bg-blue-600"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
