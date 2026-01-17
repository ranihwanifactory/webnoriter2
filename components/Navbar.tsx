
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  const isAdmin = user?.email === 'acehwan69@gmail.com';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-pink-400 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-lg group-hover:rotate-12 transition-transform">
            <i className="fas fa-gamepad"></i>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
            방구석놀이터
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="hidden md:block bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold transition-colors shadow-md"
            >
              <i className="fas fa-tools mr-2"></i>관리자
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-3">
              <img 
                src={user.photoURL || 'https://picsum.photos/40/40'} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border-2 border-pink-200"
              />
              <button 
                onClick={onLogout}
                className="text-gray-500 hover:text-pink-500 font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transform active:scale-95 transition-all"
            >
              함께 놀기!
            </button>
          )}
        </div>
      </div>
      {/* Mobile Admin Link */}
      {isAdmin && (
        <div className="md:hidden flex justify-center pb-2">
          <Link to="/admin" className="text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
            관리자 메뉴
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
