import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

export default function Signup() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            const res = await axios.post('http://localhost:3001/api/users/signup', {
                user_id: id,
                user_pw: pw,
                nickname,
            });

            if (res.data.success) {
                alert('회원가입 성공! 로그인 해주세요.');
                navigate('/');
            } else {
                alert('회원가입 실패');
            }
        } catch (err) {
            console.error('회원가입 오류:', err);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="border-2 border-black p-10 w-[450px]">
                <h1 className="text-3xl font-bold mb-4">Memo App</h1>
                <div className="flex">
                    <img src={logo} alt="memo-logo" className="w-36 h-36 mr-4" />
                    <div className="flex flex-col justify-center flex-1">
                        <input
                            placeholder="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="border w-full p-2 mb-2"
                        />
                        <input
                            type="password"
                            placeholder="pw"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            className="border w-full p-2 mb-2"
                        />
                        <input
                            placeholder="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="border w-full p-2 mb-2"
                        />
                        <button onClick={handleSignup} className="bg-sky-400 text-white p-3 w-full mb-2">
                            회원가입
                        </button>
                        <button onClick={() => navigate('/')} className="bg-gray-300 text-black p-3 w-full">
                            뒤로가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
