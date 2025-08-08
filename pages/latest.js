import { useState, useEffect } from 'react';
import { axiosGet } from '../utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiClock, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Latest() {
  const [latestEpisodes, setLatestEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestEpisodes();
  }, []);

  const fetchLatestEpisodes = async () => {
    try {
      setLoading(true);
      const response = await axiosGet('/api/latest');
      setLatestEpisodes(response.data.latest || []);
    } catch (error) {
      console.error('Error fetching latest episodes:', error);
      setError('Gagal memuat episode terbaru');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat episode terbaru..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-dark-300 mb-6">{error}</p>
        <button onClick={fetchLatestEpisodes} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-4">
          Episode Terbaru
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Update episode anime terbaru yang baru saja ditambahkan ke GitAnime.
          Dapatkan notifikasi episode terbaru dari anime favorit Anda.
        </p>
      </div>

      {/* Latest Episodes */}
      {latestEpisodes.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Anime Terbaru ({latestEpisodes.length})
            </h2>
            <Link 
              href="/"
              className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              <span>Lihat Semua Anime</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestEpisodes.map((anime, index) => (
              <div key={anime.id} className="card overflow-hidden group">
                                 {/* Anime Image Placeholder */}
                 <div className="relative h-48 bg-dark-700 flex items-center justify-center">
                   <div className="text-center">
                     <div className="text-6xl mb-2">📺</div>
                     <div className="text-sm text-dark-400">Anime Poster</div>
                   </div>
                   <div className="absolute bottom-2 left-2">
                     <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">
                       Episode {anime.latestEpisode}
                     </span>
                   </div>
                 </div>

                {/* Anime Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200 mb-2">
                    {anime.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-dark-400 mb-3">
                    <span>Total: {anime.totalEpisodes} Episode</span>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>
                        {new Date(anime.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Posted By and Released On */}
                  {(anime.postedBy || anime.releasedOn) && (
                    <div className="mb-3 text-sm text-dark-400">
                      {anime.postedBy && (
                        <p className="text-primary-400">
                          by {anime.postedBy}
                        </p>
                      )}
                      {anime.releasedOn && (
                        <p className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{anime.releasedOn}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/anime-detail?url=${encodeURIComponent(`https://v1.samehadaku.how/anime/${anime.id}/`)}`}
                      className="flex-1 btn-secondary text-center py-2 text-sm"
                    >
                      Detail Anime
                    </Link>
                    <Link
                      href={`/episode-player?url=${encodeURIComponent(anime.latestEpisodeLink)}&title=${encodeURIComponent(anime.title)}`}
                      className="flex-1 btn-primary text-center py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <FiPlay className="w-4 h-4" />
                      <span>Tonton</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center pt-8">
            <button className="btn-secondary">
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-dark-400 text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Episode Terbaru</h3>
          <p className="text-dark-300 mb-6">
            Episode terbaru akan muncul di sini setelah scraping selesai.
          </p>
          <Link href="/" className="btn-primary">
            Lihat Semua Anime
          </Link>
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6 mt-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            Tentang Update Otomatis
          </h3>
          <p className="text-dark-300 mb-4">
            GitAnime secara otomatis memperbarui data anime setiap jam dari samehadaku.how.
            Episode terbaru akan muncul di halaman ini segera setelah tersedia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">🔄</div>
              <p className="text-white font-medium">Update Otomatis</p>
              <p className="text-dark-300">Setiap jam</p>
            </div>
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">⚡</div>
              <p className="text-white font-medium">Real-time</p>
              <p className="text-dark-300">Data terbaru</p>
            </div>
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">🎯</div>
              <p className="text-white font-medium">Akurat</p>
              <p className="text-dark-300">Dari sumber resmi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
