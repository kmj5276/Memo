import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

export default function Login() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:3001/api/users/login', {
                user_id: id,
                user_pw: pw,
            });

            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/main');
            } else {
                alert('로그인 실패');
            }
        } catch (err) {
            alert('서버 오류');
            console.error('로그인 오류:', err);
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
                            className="border w-full p-2 mb-4"
                        />
                        <input
                            placeholder="pw"
                            type="password"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            className="border w-full p-2 mb-4"
                        />
                        <button onClick={handleLogin} className="bg-sky-400 text-white p-3 w-full mb-2">
                            로그인
                        </button>
                        <button onClick={() => navigate('/signup')} className="bg-sky-400 text-white p-3 w-full">
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
