import { useEffect, useRef, useState } from 'react';

type SidebarProps = {
    onClose: () => void;
    groups: string[];
    setGroups: React.Dispatch<React.SetStateAction<string[]>>;
    onSelectGroup: (group: string | null) => void;
};

export default function Sidebar({ onClose, groups, setGroups, onSelectGroup }: SidebarProps) {
    const [showGroupInput, setShowGroupInput] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [openGroupMenuIndex, setOpenGroupMenuIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const addGroup = () => {
        if (!newGroupName.trim()) return;
        setGroups((prev) => [newGroupName.trim(), ...prev]);
        setNewGroupName('');
        setShowGroupInput(false);
    };

    const updateGroupName = (index: number) => {
        const currentName = groups[index];
        const newName = prompt('새 그룹 이름을 입력하세요', currentName);
        if (newName && newName.trim()) {
            const updated = [...groups];
            updated[index] = newName.trim();
            setGroups(updated);
        }
        setOpenGroupMenuIndex(null);
    };

    const deleteGroup = (index: number) => {
        const updated = groups.filter((_, i) => i !== index);
        setGroups(updated);
        setOpenGroupMenuIndex(null);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showGroupInput && inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowGroupInput(false);
            }
            if (openGroupMenuIndex !== null && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenGroupMenuIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showGroupInput, openGroupMenuIndex]);

    return (
        <div className="h-full flex flex-col justify-between p-6 w-full">
            {/* 상단: Memo Group 클릭 시 메인 페이지로 이동 + 사이드바 닫기 */}
            <div
                className="flex justify-between items-center mb-6 cursor-pointer"
                onClick={() => {
                    onSelectGroup(null); // 메인 페이지로
                    onClose(); // ✅ 사이드바 닫기
                }}
            >
                <h2 className="text-3xl font-bold">Memo Group</h2>
                <button onClick={onClose} className="text-red-500 text-4xl font-bold hover:text-red-700">
                    ❌
                </button>
            </div>

            {/* 입력창 */}
            {showGroupInput && (
                <div ref={inputRef} className="bg-white p-4 rounded shadow mb-4">
                    <div className="font-semibold mb-2">New Group</div>
                    <input
                        type="text"
                        placeholder="NewGroupName"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="border px-3 py-2 w-full rounded mb-2"
                    />
                    <button
                        onClick={addGroup}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                    >
                        Create
                    </button>
                </div>
            )}

            {/* 그룹 목록 */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {groups.map((group, idx) => (
                    <div
                        key={idx}
                        className="relative flex justify-between items-center px-4 py-3 bg-white rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            onSelectGroup(group); // 그룹 선택
                            onClose(); // ✅ 사이드바 닫기
                        }}
                    >
                        <span className="text-lg">{group}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenGroupMenuIndex(openGroupMenuIndex === idx ? null : idx);
                            }}
                            className="text-2xl text-gray-600 hover:text-black"
                        >
                            ⋮
                        </button>

                        {/* 더보기 메뉴 */}
                        {openGroupMenuIndex === idx && (
                            <div
                                ref={menuRef}
                                className="absolute top-full right-2 mt-1 bg-white border rounded shadow z-20 w-32"
                            >
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => setOpenGroupMenuIndex(null)}
                                >
                                    Close
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => updateGroupName(idx)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                                    onClick={() => deleteGroup(idx)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* 그룹 추가 버튼 */}
                <button
                    onClick={() => setShowGroupInput(true)}
                    className="w-full mt-4 py-4 text-xl border hover:bg-gray-200 flex justify-center items-center"
                >
                    ＋ 그룹 추가
                </button>
            </div>
        </div>
    );
}
