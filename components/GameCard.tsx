
import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { getYouTubeThumbnail } from '../utils/youtube';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const ytThumbnail = game.youtubeUrl ? getYouTubeThumbnail(game.youtubeUrl) : null;
  const displayImage = game.screenshotUrl || ytThumbnail || 'https://picsum.photos/400/250';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-b-4 border-gray-100 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
      <Link to={`/game/${game.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={displayImage} 
            alt={game.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm uppercase tracking-wider">
            {game.category}
          </div>
          {ytThumbnail && !game.screenshotUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <i className="fab fa-youtube text-red-600 text-5xl opacity-80 group-hover:opacity-100 transition-opacity"></i>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            {game.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            <span className="text-pink-500 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
              놀러 가기 <i className="fas fa-arrow-right ml-2 text-xs"></i>
            </span>
            <div className="flex space-x-1 text-yellow-400">
              <i className="fas fa-star text-xs"></i>
              <i className="fas fa-star text-xs"></i>
              <i className="fas fa-star text-xs"></i>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
