import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { axiosGet } from '../utils/api';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ScrapingStatus from '../components/ScrapingStatus';
import AnimeListSkeleton from '../components/AnimeListSkeleton';
import { useToast, ToastContainer } from '../components/Toast';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function Home() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapingStatus, setScrapingStatus] = useState('idle'); // idle, scraping, completed, error
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const router = useRouter();
  const { showSuccess, showError, showInfo, toasts, removeToast } = useToast();

  // Polling untuk status scraping
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    const { search } = router.query;
    if (search) {
      setSearchQuery(search);
    }
  }, [router.query]);

  // Fungsi untuk mengecek status scraping
  const checkScrapingStatus = useCallback(async () => {
    try {
      const response = await axiosGet('/api/scraping-status');
      if (response.data.success) {
        const { status, progress, message } = response.data.data;
        setScrapingStatus(status);
        setScrapingProgress(progress || 0);
        
        // Jika scraping selesai, hentikan polling dan loading
        if (status === 'completed' || status === 'error') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          // Jika scraping selesai, set loading false
          if (status === 'completed') {
            setLoading(false);
            showSuccess('Data anime berhasil dimuat!');
          } else {
            setLoading(false);
            setError('Gagal memuat data anime');
            showError('Gagal memuat data anime');
          }
        }
      }
    } catch (error) {
      console.error('Error checking scraping status:', error);
    }
  }, [pollingInterval]);

  // Mulai polling saat komponen mount
  useEffect(() => {
    if (loading && scrapingStatus === 'idle') {
      const interval = setInterval(checkScrapingStatus, 2000); // Check setiap 2 detik
      setPollingInterval(interval);
      
      // Cleanup interval
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [loading, scrapingStatus, checkScrapingStatus]);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      setScrapingStatus('idle');
      setScrapingProgress(0);
      
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery })
      };

      const response = await axiosGet('/api/latest-episodes', { params });
      
      if (response.data.success) {
        const episodes = response.data.data.episodes || [];
        setAnime(episodes);
        
        // Use pagination data from API
        const pagination = response.data.data.pagination;
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
        
        // Jika data kosong, kemungkinan scraping sedang berjalan
        if (episodes.length === 0) {
          setScrapingStatus('scraping');
          setScrapingProgress(10);
          // Jangan set loading false jika data kosong
        } else {
          setScrapingStatus('completed');
          setScrapingProgress(100);
          setLoading(false);
        }
              } else {
          setError(response.data.message || 'Gagal memuat data anime');
          setLoading(false);
          showError(response.data.message || 'Gagal memuat data anime');
        }
      } catch (error) {
        console.error('Error fetching anime:', error);
        setError('Gagal memuat data anime');
        setLoading(false);
        showError('Gagal memuat data anime');
      }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchAnime();
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setCurrentPage(1);
      showInfo(`Mencari: "${searchQuery.trim()}"`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Removed manual force refresh per new backend policy

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/');
    showInfo('Pencarian dibersihkan');
  };

  // Tampilkan loading dengan status scraping
  if (loading || scrapingStatus === 'scraping') {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
            Selamat Datang di GitAnime
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Platform streaming anime terbaik dengan koleksi terlengkap dan update terbaru.
            Nikmati anime favorit Anda dengan kualitas terbaik.
          </p>
        </div>
        
        {/* Scraping Status */}
        <ScrapingStatus 
          status={scrapingStatus}
          progress={scrapingProgress}
          message="Mengumpulkan episode anime terbaru..."
          estimatedTime="2-3 menit"
        />
        
        {/* Skeleton Loading untuk Anime List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Episode Terbaru</h2>
            <div className="flex items-center space-x-2 bg-dark-800 rounded-lg p-1">
              <div className="p-2 rounded-md bg-primary-600 text-white">
                <FiGrid className="w-5 h-5" />
              </div>
              <div className="p-2 rounded-md text-dark-300">
                <FiList className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <AnimeListSkeleton viewMode={viewMode} count={20} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-dark-300 mb-6">{error}</p>
        <button onClick={fetchAnime} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Canonical + noindex untuk hasil pencarian */}
      <Head>
        <link rel="canonical" href={`https://gitanime-web.vercel.app/`} />
        {router.asPath.includes('?search=') && (
          <meta name="robots" content="noindex,follow" />
        )}
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'GitAnime',
              url: 'https://gitanime-web.vercel.app/',
              logo: 'https://gitanime-web.vercel.app/favicon.svg'
            }),
          }}
        />
        {/* JSON-LD: WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'GitAnime',
              url: 'https://gitanime-web.vercel.app/',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://gitanime-web.vercel.app/?search={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            }),
          }}
        />
      </Head>
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
          Selamat Datang di GitAnime
        </h1>
        <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
          Platform streaming anime terbaik dengan koleksi terlengkap dan update terbaru.
          Nikmati anime favorit Anda dengan kualitas terbaik.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Episode Terbaru'}
          </h2>
          {anime.length > 0 && (
            <span className="text-dark-300">({anime.length} episode)</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Clear Search Button */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>Bersihkan</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Anime Grid/List */}
      {anime.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {anime.map((animeItem) => (
              <AnimeCard key={animeItem.id} anime={animeItem} viewMode={viewMode} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {/* Show page numbers with better logic */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                // Adjust start page if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                return pages.map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-dark-400 text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'Tidak ada hasil' : 'Belum ada episode'}
          </h3>
          <p className="text-dark-300">
            {searchQuery 
              ? `Tidak ditemukan episode untuk "${searchQuery}"`
              : 'Episode anime akan muncul di sini setelah ditambahkan.'
            }
          </p>
        </div>
      )}

      {/* Loading More */}
      {loading && anime.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-dark-300 mt-2">Memuat lebih banyak...</p>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
