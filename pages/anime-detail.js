import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { axiosGet } from '../utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiArrowLeft, FiCalendar, FiClock, FiTag, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AnimeDetail() {
  const router = useRouter();
  const { url } = router.query;
  const [animeDetail, setAnimeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (url) {
      fetchAnimeDetail();
    }
  }, [url]);

  const fetchAnimeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching anime detail for URL:', url);
      const response = await axiosGet(`/api/anime-detail?url=${encodeURIComponent(url)}`);
      
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        setAnimeDetail(response.data.data);
      } else {
        const errorMessage = response.data?.message || 'Gagal memuat detail anime';
        console.error('API returned error:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching anime detail:', error);
      let errorMessage = 'Gagal memuat detail anime';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRetry = () => {
    if (url) {
      fetchAnimeDetail();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4">Memuat detail anime...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">Terjadi Kesalahan</h1>
          <p className="text-dark-300 mb-4">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!animeDetail) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-dark-400 text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">Anime Tidak Ditemukan</h3>
          <p className="text-dark-300 mb-4">
            Detail anime tidak dapat dimuat.
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              ← Kembali
            </button>
            <h1 className="text-white text-xl font-semibold">
              {animeDetail.title || 'Detail Anime'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-8">
          {/* Anime Header */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Anime Image */}
              <div className="flex-shrink-0">
                {(animeDetail.episodeScreenshot || animeDetail.image) ? (
                  <div className="w-48 h-64 relative rounded-lg overflow-hidden">
                    <Image
                      src={animeDetail.episodeScreenshot || animeDetail.image || 'https://via.placeholder.com/192x256/1f2937/6b7280?text=No+Image'}
                      alt={animeDetail.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/192x256/1f2937/6b7280?text=No+Image';
                      }}
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                  </div>
                ) : (
                  <div className="w-48 h-64 bg-dark-700 rounded-lg flex items-center justify-center">
                    <FiPlay className="w-16 h-16 text-dark-400" />
                  </div>
                )}
              </div>

              {/* Anime Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{animeDetail.title}</h1>
                
                {animeDetail.japanese && (
                  <p className="text-dark-300 mb-2">
                    <strong className="text-white">Japanese:</strong> {animeDetail.japanese}
                  </p>
                )}
                
                {animeDetail.english && (
                  <p className="text-dark-300 mb-2">
                    <strong className="text-white">English:</strong> {animeDetail.english}
                  </p>
                )}

                {/* Anime Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {animeDetail.status && (
                    <div className="flex items-center space-x-2">
                      <FiTag className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Status:</strong> {animeDetail.status}
                      </span>
                    </div>
                  )}

                  {animeDetail.type && (
                    <div className="flex items-center space-x-2">
                      <FiPlay className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Type:</strong> {animeDetail.type}
                      </span>
                    </div>
                  )}

                  {animeDetail.episodes && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Episodes:</strong> {animeDetail.episodes}
                      </span>
                    </div>
                  )}

                  {animeDetail.duration && (
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Duration:</strong> {animeDetail.duration}
                      </span>
                    </div>
                  )}

                  {animeDetail.rating && (
                    <div className="flex items-center space-x-2">
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Rating:</strong> {animeDetail.rating}
                      </span>
                    </div>
                  )}

                  {animeDetail.releaseDate && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300">
                        <strong className="text-white">Release Date:</strong> {animeDetail.releaseDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {animeDetail.genres && animeDetail.genres.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-2">Genres:</h3>
                    <div className="flex flex-wrap gap-2">
                      {animeDetail.genres.map((genre, index) => (
                        <span key={index} className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synopsis */}
                {animeDetail.synopsis && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-2">Synopsis:</h3>
                    <p className="text-dark-300 leading-relaxed">
                      {animeDetail.synopsis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Episodes List */}
          {animeDetail.episodes && animeDetail.episodes.length > 0 && (
            <div className="card p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Daftar Episode</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animeDetail.episodes.map((episode, index) => (
                  <Link
                    key={episode.id || index}
                    href={`/episode-player?url=${encodeURIComponent(episode.url)}&title=${encodeURIComponent(animeDetail.title)}`}
                    className="block p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Episode {episode.episodeNumber || index + 1}</h3>
                        {episode.title && (
                          <p className="text-dark-300 text-sm mt-1">{episode.title}</p>
                        )}
                      </div>
                      <FiPlay className="w-5 h-5 text-primary-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
