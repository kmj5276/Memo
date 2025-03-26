type MemoCardProps = {
    title: string;
    content?: string;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onDelete: () => void;
    showMenu?: boolean;
    onClick?: () => void;
    onEdit?: () => void;
};

export default function MemoCard({
    title,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onDelete,
    showMenu = true,
    onClick,
    onEdit,
}: MemoCardProps) {
    return (
        <div
            className="relative border rounded p-4 w-96 h-72 bg-white shadow hover:shadow-xl transition cursor-pointer"
            onClick={() => {
                // 카드 클릭 시 onClick 실행
                if (onClick) onClick();
            }}
        >
            <div className="text-2xl font-bold mb-2 truncate">{title}</div>

            {showMenu && (
                <>
                    {/* 메뉴 버튼 클릭 시 카드 onClick이 실행되지 않도록 stopPropagation 사용 */}
                    <button
                        className="absolute top-3 right-3 text-2xl memo-toggle-button"
                        onClick={(e) => {
                            e.stopPropagation(); // ✅ 클릭 이벤트 전파 방지
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
                                    onEdit?.(); // ✅ 안전하게 호출
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
