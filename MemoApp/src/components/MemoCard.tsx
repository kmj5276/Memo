// MemoCard.tsx
import { FaStar } from 'react-icons/fa';
import { getLastModifiedDate } from '../dateUtils';

type MemoCardProps = {
    title: string;
    content?: string;
    image_url?: string;
    isPinned?: boolean;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onDelete: () => void;
    showMenu?: boolean;
    onClick?: () => void;
    onEdit?: () => void;
    onTogglePin?: () => void;
    created_at?: string;
    updated_at?: string;
};

export default function MemoCard({
    title,
    image_url,
    isPinned = false,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onDelete,
    showMenu = true,
    onClick,
    onEdit,
    onTogglePin,
    created_at,
    updated_at,
}: MemoCardProps) {
    const modifiedDate = getLastModifiedDate(created_at, updated_at);

    return (
        <div
            className="relative border rounded p-4 w-96 h-72 bg-white shadow hover:shadow-xl transition cursor-pointer"
            onClick={() => onClick?.()}
        >
            <div className="text-2xl font-bold mb-2 truncate">{title}</div>

            {image_url && (
                <img
                    src={`http://localhost:3001${image_url}`}
                    className="w-full object-contain max-h-40 mb-2 rounded" // object-contain으로 잘림 방지
                    alt="첨부 이미지"
                />
            )}

            {/* 좌측 하단 날짜 표시 */}
            <div className="absolute bottom-3 left-4 text-sm text-gray-500">
                마지막으로 수정한 날짜: {updated_at || created_at || '없음'}
            </div>

            {/* 우측 하단 즐겨찾기 */}
            <div
                className="absolute bottom-3 right-4 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin?.();
                }}
            >
                <FaStar className={`text-2xl transition-colors ${isPinned ? 'text-yellow-400' : 'text-gray-300'}`} />
            </div>

            {/* 기존 메뉴 버튼 */}
            {showMenu && (
                <>
                    <button
                        className="absolute top-3 right-3 text-2xl memo-toggle-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMenu();
                        }}
                    >
                        ⋮
                    </button>
                    {isMenuOpen && (
                        <div
                            className="absolute top-12 right-3 bg-white border rounded shadow p-2 space-y-2 z-10 memo-menu"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="text-left w-full hover:bg-gray-100 px-4 py-2"
                                onClick={() => {
                                    onEdit?.();
                                    onCloseMenu();
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="text-left w-full hover:bg-red-100 text-red-600 px-4 py-2"
                                onClick={() => {
                                    onDelete();
                                    onCloseMenu();
                                }}
                            >
                                Delete
                            </button>
                            <button className="text-left w-full hover:bg-gray-100 px-4 py-2" onClick={onCloseMenu}>
                                Close
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
