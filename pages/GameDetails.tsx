
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Game, Review, User } from '../types';
import { getYouTubeEmbedUrl } from '../utils/youtube';

interface GameDetailsProps {
  user: User | null;
}

const GameDetails: React.FC<GameDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      try {
        const docRef = doc(db, 'games', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGame({ id: docSnap.id, ...docSnap.data() } as Game);
        }
      } catch (err) {
        console.error("Game fetch error:", err);
      }
      setLoading(false);
    };

    fetchGame();

    // 복합 인덱스 오류를 피하기 위해 orderBy를 제거하고 클라이언트에서 정렬합니다.
    const reviewsQ = query(
      collection(db, 'reviews'), 
      where('gameId', '==', id)
    );

    const unsubscribe = onSnapshot(reviewsQ, (snapshot) => {
      const reviewList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      // 최신순으로 클라이언트에서 직접 정렬
      reviewList.sort((a, b) => b.createdAt - a.createdAt);
      
      setReviews(reviewList);
    }, (error) => {
      console.error("Reviews snapshot error:", error);
      // 인덱스 등의 문제로 실시간 업데이트가 실패할 경우 사용자에게 알릴 수 있습니다.
    });

    return () => unsubscribe();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다!");
      return;
    }
    if (!id || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        gameId: id,
        userId: user.uid,
        userName: user.displayName || '익명의 꼬마 친구',
        userPhoto: user.photoURL,
        comment: newComment,
        rating: newRating,
        createdAt: Date.now()
      });
      setNewComment('');
      setNewRating(5);
      alert("리뷰가 등록되었습니다! ✨");
    } catch (error: any) {
      console.error("Error adding review:", error);
      alert("리뷰 등록에 실패했습니다. (권한이나 데이터베이스 설정을 확인해주세요)");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('리뷰를 삭제할까요?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
      } catch (err) {
        alert("삭제 권한이 없습니다.");
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.title,
        text: game?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('이 링크를 복사해서 공유해보세요: ' + window.location.href);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-pink-500 text-2xl animate-bounce">장난감 상자 여는 중... 🎁</div>;
  if (!game) return <div className="text-center py-20 text-gray-500">게임을 찾을 수 없어요. 😢</div>;

  const embedUrl = game.youtubeUrl ? getYouTubeEmbedUrl(game.youtubeUrl) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/" className="text-indigo-600 font-bold hover:underline inline-flex items-center">
        <i className="fas fa-chevron-left mr-2"></i> 놀이터로 돌아가기
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-50">
        <div className="aspect-video bg-gray-100">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              title="Game Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : game.screenshotUrl ? (
            <img src={game.screenshotUrl} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">미리보기 영상이나 이미지가 없어요.</div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                {game.category}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-800">{game.title}</h1>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleShare}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-full transition-colors"
                title="공유하기"
              >
                <i className="fas fa-share-alt"></i>
              </button>
              <a 
                href={game.appUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transform active:scale-95 transition-all flex items-center"
              >
                지금 플레이하기 <i className="fas fa-external-link-alt ml-2"></i>
              </a>
            </div>
          </div>

          <div className="prose prose-pink max-w-none mb-10">
            <h3 className="text-lg font-bold text-gray-700 mb-2 border-l-4 border-pink-400 pl-3 uppercase tracking-tight">게임 이야기</h3>
            <p className="text-gray-600 leading-relaxed text-lg italic bg-gray-50 p-6 rounded-2xl">
              {game.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-comments text-pink-400 mr-2"></i> 친구들의 리뷰 ({reviews.length})
            </h2>

            {user ? (
              <form onSubmit={handleSubmitReview} className="mb-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <span className="font-bold text-gray-700 mr-4">내 점수는?</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-2xl transition-all ${newRating >= star ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="이 게임 어땠나요? 재미있었는지 알려주세요! 🌟"
                  className="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-indigo-300 mb-4 h-24"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-full font-bold shadow-md transition-all active:scale-95"
                >
                  리뷰 남기기
                </button>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-yellow-50 rounded-2xl text-center text-yellow-700 border border-yellow-100">
                <p className="font-bold mb-2">리뷰를 남기고 싶나요?</p>
                <p className="text-sm">로그인을 하면 친구들과 의견을 나눌 수 있어요!</p>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <img 
                      src={review.userPhoto || 'https://picsum.photos/40/40'} 
                      alt={review.userName} 
                      className="w-12 h-12 rounded-full border-2 border-indigo-100 shrink-0"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">{review.userName}</h4>
                        <div className="flex text-yellow-400 text-xs">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <i key={i} className="fas fa-star"></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{review.comment}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {(user?.uid === review.userId || user?.email === 'acehwan69@gmail.com') && (
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            삭제하기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center italic py-4">아직 리뷰가 없어요. 첫 번째 주인공이 되어보세요! ✨</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
