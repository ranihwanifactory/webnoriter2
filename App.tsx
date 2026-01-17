
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from './firebase';
import { User } from './types';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import GameDetails from './pages/GameDetails';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    // 1. 인증 상태 감시
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // 2. 방문자 카운트 및 실시간 감시 로직
    const setupStats = () => {
      const statsDocRef = doc(db, 'stats', 'site');
      const hasVisited = sessionStorage.getItem('visited');
      
      // 실시간 업데이트 감시
      const unsubscribeStats = onSnapshot(statsDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setVisitCount(snapshot.data().totalVisits || 0);
        }
      }, (error) => {
        // 권한 에러 등이 발생할 경우 조용히 처리
        if (error.code === 'permission-denied') {
          console.warn("방문자 통계 읽기 권한이 없습니다. Firebase Console의 Rules 설정을 확인해주세요.");
        } else {
          console.error("Stats listener error:", error);
        }
      });

      // 방문자 수 증가 처리 (세션당 1회)
      if (!hasVisited) {
        // setDoc with merge:true + increment는 문서가 없으면 생성, 있으면 업데이트를 단일 작업으로 수행합니다.
        setDoc(statsDocRef, { 
          totalVisits: increment(1) 
        }, { merge: true })
        .then(() => {
          sessionStorage.setItem('visited', 'true');
        })
        .catch((err) => {
          if (err.code === 'permission-denied') {
            console.warn("방문자 통계 쓰기 권한이 없습니다. Rules 설정을 확인해주세요.");
          } else {
            console.error("Stats update error:", err);
          }
        });
      }

      return unsubscribeStats;
    };

    const statsUnsubscribe = setupStats();

    return () => {
      unsubscribeAuth();
      if (statsUnsubscribe) statsUnsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-50">
        <div className="text-center">
          <div className="animate-bounce mb-4 text-6xl text-pink-400">🎮</div>
          <p className="text-pink-500 font-bold text-xl">놀이터 문 여는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogin={loginWithGoogle} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/game/:id" element={<GameDetails user={user} />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-8 text-center text-gray-500">
          <div className="container mx-auto px-4 space-y-3">
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-sm">
                <i className="fas fa-users mr-2"></i>
                지금까지 <span className="text-indigo-700 mx-1">{visitCount.toLocaleString()}</span>명의 친구들이 놀러왔어요!
              </div>
            </div>
            
            <p className="text-sm font-medium">© 2024 방구석놀이터. 즐거운 방학 보내세요! 🎈</p>
            
            <p className="text-xs">
              제작자 출처 : 
              <a 
                href="https://ranihwanibaby.tistory.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-pink-400 hover:text-pink-600 font-bold underline transition-colors"
              >
                great80k
              </a>
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
