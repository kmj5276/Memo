import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MemoGrid from './components/MemoGrid';
import MemoEditor from './components/MemoEditor';
import MemoViewer from './components/MemoViewer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Memo, Group } from './types';

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [memos, setMemos] = useState<Memo[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [editingMemoIndex, setEditingMemoIndex] = useState<number | null>(null);
    const [viewingMemo, setViewingMemo] = useState<{ title: string; content: string; image_url?: string } | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const DEFAULT_USER_IDX = 1;

    const navigate = useNavigate();
    // 로그인된 사용자 정보
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const user_idx = user?.idx; // 로그인된 사용자 id로 사용

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    // 그룹 목록 불러오기
    const fetchGroups = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/groups/${user_idx}`);
            setGroups(res.data);
        } catch (err) {
            console.error('그룹 목록 불러오기 실패:', err);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchMemos();
    }, []);

    const fetchMemos = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/memos/${user_idx}`); // ✅ 사용자 ID 전달
            setMemos(res.data);
        } catch (err) {
            console.error('메모 불러오기 실패:', err);
        }
    };

    const handleCreateMemo = async (title: string) => {
        if (!title.trim() || !selectedGroup) return;

        try {
            const res = await axios.post('http://localhost:3001/api/memos', {
                title: title.trim(),
                contents: '',
                group_idx_t: selectedGroup.idx,
                user_idx_t: user?.idx,
            });

            const insertedMemo: Memo = {
                idx: res.data.insertedId,
                title: title.trim(),
                content: '',
                group_idx: selectedGroup.idx,
                group_name: selectedGroup.group_name,
                isPinned: false,
                pin_order: null,
            };

            // 1. 새 메모를 일반 메모 중 가장 앞에 넣기
            const pinned = memos.filter((m) => m.isPinned);
            const unpinned = memos.filter((m) => !m.isPinned);
            const newUnpinned = [insertedMemo, ...unpinned];
            const newMemos = [...pinned, ...newUnpinned];

            setMemos(newMemos);

            setEditingMemoIndex(insertedMemo.idx); // 메모 ID 자체를 저장
        } catch (err) {
            console.error('메모 저장 실패:', err);
        }
    };

    const handleUpdateMemo = async (
        newTitle: string,
        newContent: string,
        image?: File | null,
        removeImage?: boolean
    ) => {
        if (!editingMemo) return;

        const formData = new FormData();
        formData.append('title', newTitle);
        formData.append('contents', newContent);
        if (image) {
            formData.append('image', image);
        }
        if (removeImage) {
            formData.append('removeImage', 'true'); // ✅ 서버에서 제거 여부 확인
        }

        try {
            await axios.put(`http://localhost:3001/api/memos/${editingMemo.idx}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchMemos();
        } catch (err) {
            console.error('수정 실패:', err);
        }

        setEditingMemoIndex(null);
    };

    const togglePin = async (index: number) => {
        const memo = memos[index];
        const isPinned = !memo.isPinned;

        try {
            await axios.patch(`http://localhost:3001/api/memos/${memo.idx}/pin`, {
                is_pinned: isPinned,
            });

            setMemos((prev) => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    isPinned,
                };

                // ⭐ 즐겨찾기된 메모는 pin_order 기준, 아니면 created_at 기준 정렬
                return updated.sort((a, b) => {
                    if (a.isPinned && b.isPinned) {
                        return (a.pin_order ?? 0) - (b.pin_order ?? 0);
                    }
                    if (a.isPinned) return -1;
                    if (b.isPinned) return 1;
                    return 0;
                });
            });
        } catch (err) {
            console.error('즐겨찾기 상태 변경 실패:', err);
        }
    };

    const deleteMemo = async (index: number) => {
        const deletedMemo = memos.find((m) => m.idx === index);
        if (!deletedMemo) return;

        try {
            await axios.delete(`http://localhost:3001/api/memos/${deletedMemo.idx}`);
            setMemos((prev) => prev.filter((m) => m.idx !== deletedMemo.idx));
        } catch (err) {
            console.error('삭제 실패:', err);
        }

        if (openMenuIndex === index) {
            setOpenMenuIndex(null);
        } else if (openMenuIndex !== null && index < openMenuIndex) {
            setOpenMenuIndex(openMenuIndex - 1);
        }
    };

    const clearAllMemos = async () => {
        if (!selectedGroup) return;

        const confirmed = window.confirm(`정말로 '${selectedGroup.group_name}'의 메모를 전부 삭제하시겠습니까?`);

        if (!confirmed) return;

        try {
            // 1. 백엔드 API 호출: 이 그룹의 모든 메모 삭제
            await axios.delete(`http://localhost:3001/api/memos/group/${selectedGroup.idx}`);

            // 2. 상태에서 삭제
            setMemos((prev) => prev.filter((m) => m.group_idx !== selectedGroup.idx));

            // 3. 오픈된 메뉴 초기화
            setOpenMenuIndex(null);
        } catch (err) {
            console.error('전체 삭제 실패:', err);
        }
    };

    const editingMemo = memos.find((m) => m.idx === editingMemoIndex);

    useEffect(() => {
        fetchGroups();
        fetchMemos();
    }, []);

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
        <div className="relative min-h-screen overflow-y-auto bg-white">
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

            <div className={`absolute top-6 right-6 z-50 ${isSidebarOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded text-xl hover:bg-red-600"
                    onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/');
                    }}
                >
                    Logout
                </button>
            </div>

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
                    user_idx={user_idx}
                    selectedGroup={selectedGroup}
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
                            <h2 className="text-3xl font-bold mb-4">{selectedGroup.group_name}</h2>
                            <MemoGrid
                                memos={memos.filter((m) => m.group_idx === selectedGroup.idx)}
                                onDeleteMemo={deleteMemo}
                                openMenuIndex={openMenuIndex}
                                setOpenMenuIndex={setOpenMenuIndex}
                                onMemoClick={(memo) =>
                                    setViewingMemo({
                                        title: memo.title,
                                        content: memo.content,
                                        image_url: memo.image_url,
                                    })
                                }
                                onEditMemo={(idx) => setEditingMemoIndex(idx)}
                                onTogglePin={togglePin}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold mb-10">📌 메모 그룹별 미리보기</h2>
                            {groups.length === 0 && (
                                <div className="text-xl text-gray-500 text-center space-y-6">
                                    <p>왼쪽에서 메모 그룹을 추가해보세요!</p>

                                    {/* ✅ 새로운 메모 시작 버튼 */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await axios.post('http://localhost:3001/api/groups', {
                                                    group_name: 'Main',
                                                    user_idx_t: DEFAULT_USER_IDX,
                                                });

                                                const newGroup: Group = {
                                                    idx: res.data.insertedId,
                                                    group_name: 'Main',
                                                };

                                                setGroups([newGroup]);
                                                setSelectedGroup(newGroup);
                                            } catch (err) {
                                                console.error('Main 그룹 생성 실패:', err);
                                            }
                                        }}
                                        className="w-full h-20 bg-blue-500 text-white rounded-lg text-2xl font-semibold hover:bg-blue-600 transition"
                                    >
                                        새로운 메모 시작하기
                                    </button>
                                </div>
                            )}
                            {groups.map((group) => {
                                const groupMemos = memos.filter((m) => m.group_idx === group.idx).slice(0, 5);
                                return (
                                    <div key={group.idx} className="mb-12">
                                        <h3
                                            onClick={() => setSelectedGroup(group)}
                                            className="text-2xl font-semibold mb-4 cursor-pointer hover:underline hover:text-blue-600 transition"
                                        >
                                            {group.group_name}
                                        </h3>
                                        {groupMemos.length > 0 ? (
                                            <MemoGrid
                                                memos={groupMemos}
                                                onDeleteMemo={() => {}}
                                                openMenuIndex={null}
                                                setOpenMenuIndex={() => {}}
                                                showMenu={false}
                                                onMemoClick={(memo) =>
                                                    setViewingMemo({
                                                        title: memo.title,
                                                        content: memo.content,
                                                        image_url: memo.image_url,
                                                    })
                                                }
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

            {editingMemo && (
                <MemoEditor
                    title={editingMemo.title}
                    content={editingMemo.content}
                    image_url={editingMemo.image_url} // 추가
                    onClose={() => setEditingMemoIndex(null)}
                    onSave={handleUpdateMemo}
                />
            )}

            {viewingMemo && (
                <MemoViewer
                    title={viewingMemo.title}
                    content={viewingMemo.content}
                    image_url={viewingMemo.image_url}
                    onClose={() => setViewingMemo(null)}
                />
            )}
        </div>
    );
}
