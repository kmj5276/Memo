import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Group } from '../types';

type SidebarProps = {
    onClose: () => void;
    groups: Group[];
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
    onSelectGroup: (group: Group | null) => void;
    user_idx: number;
    selectedGroup: Group | null;
};

export default function Sidebar({ onClose, groups, setGroups, onSelectGroup, user_idx, selectedGroup }: SidebarProps) {
    const [showGroupInput, setShowGroupInput] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [openGroupMenuIndex, setOpenGroupMenuIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const addGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            const res = await axios.post('http://localhost:3001/api/groups', {
                group_name: newGroupName.trim(),
                user_idx_t: user_idx,
            });

            const insertedGroup: Group = {
                idx: res.data.insertedId,
                group_name: newGroupName.trim(),
            };

            setGroups((prev) => [insertedGroup, ...prev]);
            setNewGroupName('');
            setShowGroupInput(false);
        } catch (err) {
            console.error('그룹 생성 실패:', err);
        }
    };

    const updateGroupName = async (index: number) => {
        const currentGroup = groups[index];
        const newName = prompt('새 그룹 이름을 입력하세요', currentGroup.group_name);

        if (!newName || !newName.trim()) return;

        try {
            await axios.put(`http://localhost:3001/api/groups/${currentGroup.idx}`, {
                group_name: newName.trim(),
            });

            const updated = [...groups];
            updated[index] = { ...updated[index], group_name: newName.trim() };
            setGroups(updated);
        } catch (err) {
            console.error('그룹 이름 수정 실패:', err);
        }

        setOpenGroupMenuIndex(null);
    };

    const deleteGroup = async (index: number) => {
        const groupToDelete = groups[index];

        try {
            await axios.delete(`http://localhost:3001/api/groups/${groupToDelete.idx}`);
            setGroups((prev) => prev.filter((_, i) => i !== index));

            // ✅ 현재 선택된 그룹이면 메인화면으로
            if (groupToDelete.idx === selectedGroup?.idx) {
                onSelectGroup(null);
                onClose();
            }
        } catch (err) {
            console.error('그룹 삭제 실패:', err);
        }

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
                    onClose(); // 사이드바 닫기
                }}
            >
                <h2 className="text-3xl font-bold">Memo Group</h2>
                <button onClick={onClose} className="text-red-500 text-4xl font-bold hover:text-red-700">
                    ❌
                </button>
            </div>

            {/* 그룹 입력창 */}
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
                        key={group.idx}
                        className="relative flex justify-between items-center px-4 py-3 bg-white rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            onSelectGroup(group);
                            onClose();
                        }}
                    >
                        <span className="text-lg">{group.group_name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenGroupMenuIndex(openGroupMenuIndex === idx ? null : idx);
                            }}
                            className="text-2xl text-gray-600 hover:text-black"
                        >
                            ⋮
                        </button>

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
