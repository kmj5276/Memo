import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MemoGrid from './components/MemoGrid';
import MemoEditor from './components/MemoEditor';
import MemoViewer from './components/MemoViewer';

export type Memo = {
    title: string;
    content: string;
    group: string;
};

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [memos, setMemos] = useState<Memo[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [editingMemoIndex, setEditingMemoIndex] = useState<number | null>(null);
    const [viewingMemo, setViewingMemo] = useState<Memo | null>(null);

    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleCreateMemo = (title: string) => {
        if (!title.trim() || !selectedGroup) return;
        const newMemo: Memo = { title: title.trim(), content: '', group: selectedGroup };
        setMemos((prev) => [newMemo, ...prev]);
        setEditingMemoIndex(0); // 방금 추가한 메모의 인덱스로 편집 열기
    };

    const handleUpdateMemo = (newTitle: string, newContent: string) => {
        if (editingMemoIndex === null) return;
        setMemos((prev) => {
            const updated = [...prev];
            updated[editingMemoIndex] = {
                ...updated[editingMemoIndex],
                title: newTitle,
                content: newContent,
            };
            return updated;
        });
        setEditingMemoIndex(null);
    };

    const clearAllMemos = () => {
        if (!selectedGroup) return;
        setMemos((prev) => prev.filter((m) => m.group !== selectedGroup));
        setOpenMenuIndex(null);
    };

    const deleteMemo = (index: number) => {
        const memosInGroup = memos.filter((m) => m.group === selectedGroup);
        const deletedMemo = memosInGroup[index];
        setMemos((prev) => prev.filter((m) => m !== deletedMemo));

        if (openMenuIndex === index) {
            setOpenMenuIndex(null);
        } else if (openMenuIndex !== null && index < openMenuIndex) {
            setOpenMenuIndex(openMenuIndex - 1);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openMenuIndex !== null) {
                const target = e.target as HTMLElement;
                const isInsideMenu = target.closest('.memo-menu') !== null;
                const isToggleBtn = target.closest('.memo-toggle-button') !== null;

                if (!isInsideMenu && !isToggleBtn) {
                    setOpenMenuIndex(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [openMenuIndex]);

    return (
        <div className="relative min-h-screen overflow-y-auto">
            {!isSidebarOpen && (
                <div className="absolute top-6 left-6 z-50">
                    <button
                        className="bg-gray-800 text-white px-4 py-2 rounded text-2xl"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        ☰
                    </button>
                </div>
            )}

            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-screen w-[20rem] bg-white border-r shadow-md z-50 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-[20rem]'
                }`}
            >
                <Sidebar
                    onClose={() => setIsSidebarOpen(false)}
                    groups={groups}
                    setGroups={setGroups}
                    onSelectGroup={(group) => {
                        setSelectedGroup(group);
                        setIsSidebarOpen(false);
                    }}
                />
            </div>

            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-40"
                />
            )}

            <div className="relative z-30 flex justify-center w-full mt-32 px-6">
                <div className="w-full max-w-6xl">
                    {selectedGroup ? (
                        <>
                            <Header onAddMemo={handleCreateMemo} onClearAll={clearAllMemos} />
                            <h2 className="text-3xl font-bold mb-4">{selectedGroup}</h2>
                            <MemoGrid
                                memos={memos.filter((m) => m.group === selectedGroup)}
                                onDeleteMemo={deleteMemo}
                                openMenuIndex={openMenuIndex}
                                setOpenMenuIndex={setOpenMenuIndex}
                                onMemoClick={(memo) => setViewingMemo(memo)}
                                onEditMemo={(idx) => setEditingMemoIndex(idx)}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold mb-10">📌 메모 그룹별 미리보기</h2>
                            {groups.length === 0 && (
                                <div className="text-xl text-gray-500 text-center space-y-6">
                                    <p>왼쪽에서 메모 그룹을 추가해보세요!</p>
                                    <button
                                        onClick={() => {
                                            if (!groups.includes('Main')) {
                                                setGroups((prev) => ['Main', ...prev]);
                                            }
                                            setSelectedGroup('Main');
                                        }}
                                        className="w-full h-20 bg-blue-500 text-white rounded-lg text-2xl font-semibold hover:bg-blue-600 transition"
                                    >
                                        메모 시작하기
                                    </button>
                                </div>
                            )}
                            {groups.map((group) => {
                                const groupMemos = memos.filter((m) => m.group === group).slice(0, 5);
                                return (
                                    <div key={group} className="mb-12">
                                        <h3
                                            onClick={() => setSelectedGroup(group)}
                                            className="text-2xl font-semibold mb-4 cursor-pointer hover:underline hover:text-blue-600 transition"
                                        >
                                            {group}
                                        </h3>
                                        {groupMemos.length > 0 ? (
                                            <MemoGrid
                                                memos={groupMemos}
                                                onDeleteMemo={() => {}}
                                                openMenuIndex={null}
                                                setOpenMenuIndex={() => {}}
                                                showMenu={false}
                                                onMemoClick={(memo) => setViewingMemo(memo)}
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-lg">메모가 없습니다.</div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {editingMemoIndex !== null && (
                <MemoEditor
                    title={memos[editingMemoIndex].title}
                    content={memos[editingMemoIndex].content}
                    onClose={() => setEditingMemoIndex(null)}
                    onSave={handleUpdateMemo}
                />
            )}

            {viewingMemo && (
                <MemoViewer
                    title={viewingMemo.title}
                    content={viewingMemo.content}
                    onClose={() => setViewingMemo(null)}
                />
            )}
        </div>
    );
}
