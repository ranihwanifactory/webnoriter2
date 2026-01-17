
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Game, User } from '../types';

interface AdminDashboardProps {
  user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const isAdmin = user?.email === 'acehwan69@gmail.com';

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('액션');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchGames();
  }, [isAdmin]);

  const fetchGames = async () => {
    setLoading(true);
    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const gameList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Game[];
    setGames(gameList);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('액션');
    setDescription('');
    setScreenshotUrl('');
    setYoutubeUrl('');
    setAppUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const gameData = {
      title,
      category,
      description,
      screenshotUrl,
      youtubeUrl,
      appUrl,
      authorEmail: user?.email,
      createdAt: Date.now()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'games', editingId), gameData);
      } else {
        await addDoc(collection(db, 'games'), gameData);
      }
      resetForm();
      fetchGames();
    } catch (err) {
      console.error("Error saving game:", err);
      alert("문제가 발생했습니다!");
    }
  };

  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    setTitle(game.title);
    setCategory(game.category);
    setDescription(game.description);
    setScreenshotUrl(game.screenshotUrl || '');
    setYoutubeUrl(game.youtubeUrl || '');
    setAppUrl(game.appUrl);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("정말 이 게임을 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, 'games', id));
      fetchGames();
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">관리자 대시보드</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-indigo-700 transition-colors"
        >
          {showForm ? '취소' : '+ 새 게임 추가'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-100 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">게임 제목</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="예: 마법 숲 탐험"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">카테고리</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none"
                >
                  <option>액션</option>
                  <option>퍼즐</option>
                  <option>교육</option>
                  <option>아케이드</option>
                  <option>시뮬레이션</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">게임 실행 주소(URL)</label>
                <input 
                  type="url" required value={appUrl} onChange={e => setAppUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://game-link.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">스크린샷 URL (선택)</label>
                <input 
                  type="url" value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://image-link.com/shot.png"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">YouTube 영상 URL (선택)</label>
                <input 
                  type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">게임 설명</label>
                <textarea 
                  required value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-indigo-300 outline-none h-44"
                  placeholder="아이들에게 이 게임을 소개해주세요!"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-8 py-2 text-gray-500 font-bold"
              >
                초기화
              </button>
              <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-2 rounded-full font-bold shadow-lg transition-all"
              >
                {editingId ? '수정 완료' : '게임 올리기'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">게임명</th>
              <th className="px-6 py-4">카테고리</th>
              <th className="px-6 py-4">등록일</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {games.map(game => (
              <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{game.title}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {game.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(game.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleEdit(game)}
                    className="text-indigo-500 hover:text-indigo-700 p-2"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(game.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
