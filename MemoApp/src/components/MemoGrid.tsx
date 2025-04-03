import { useEffect, useRef } from 'react';
import MemoCard from './MemoCard';
import { Memo } from '../types';

type MemoGridProps = {
    memos: Memo[];
    onDeleteMemo: (index: number) => void;
    openMenuIndex: number | null;
    setOpenMenuIndex: (index: number | null) => void;
    showMenu?: boolean;
    onMemoClick?: (memo: Memo) => void;
    onEditMemo?: (index: number) => void; // ✅ 선언만 해놓고
    onTogglePin?: (index: number) => void; // ✅ 추가
};

export default function MemoGrid({
    memos,
    onDeleteMemo,
    openMenuIndex,
    setOpenMenuIndex,
    showMenu = true,
    onMemoClick,
    onEditMemo,
    onTogglePin,
}: MemoGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openMenuIndex !== null && gridRef.current && !gridRef.current.contains(e.target as Node)) {
                setOpenMenuIndex(null);
            }
        };

        if (openMenuIndex !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuIndex, setOpenMenuIndex]);

    if (memos.length === 0) {
        return <div className="text-center text-2xl text-gray-500 mt-20">새 메모를 추가해보세요!</div>;
    }

    return (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {memos.map((memo, idx) => (
                <MemoCard
                    key={idx}
                    title={memo.title}
                    content={memo.content}
                    image_url={memo.image_url}
                    isPinned={memo.isPinned}
                    isMenuOpen={openMenuIndex === idx}
                    onToggleMenu={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)}
                    onCloseMenu={() => setOpenMenuIndex(null)}
                    onEdit={() => onEditMemo?.(memo.idx)}
                    onDelete={() => onDeleteMemo(memo.idx)}
                    showMenu={showMenu}
                    onClick={() => onMemoClick?.(memo)}
                    onTogglePin={() => onTogglePin?.(idx)}
                    created_at={memo.created_at}
                    updated_at={memo.updated_at}
                />
            ))}
        </div>
    );
}
