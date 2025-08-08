import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { axiosGet } from '../utils/api';
import AnimeListCard from '../components/AnimeListCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiRefreshCw } from 'react-icons/fi';

export default function AnimeList() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  const [summary, setSummary] = useState({});
  const router = useRouter();

  useEffect(() => {
    const { search, status, sortBy, sortOrder } = router.query;
    if (search) setSearchQuery(search);
    if (status) setFilters(prev => ({ ...prev, status }));
    if (sortBy) setFilters(prev => ({ ...prev, sortBy }));
    if (sortOrder) setFilters(prev => ({ ...prev, sortOrder }));
  }, [router.query]);

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.status && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder })
      };

      const response = await axiosGet('/api/anime-list', { params });
      
      if (response.data.success) {
        setAnime(response.data.data.anime);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
        setSummary(response.data.data.summary || {});
      } else {
        setError(response.data.message || 'Gagal memuat data anime');
      }
    } catch (error) {
      console.error('Error fetching anime:', error);
      setError('Gagal memuat data anime');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters.status, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push({
        pathname: '/anime',
        query: { search: searchQuery.trim() }
      });
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    const query = { ...router.query, [key]: value };
    if (value === '') delete query[key];
    router.push({ pathname: '/anime', query });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/anime');
  };

  const handlePageChange = (page) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleForceRefresh = () => {
    const params = {
      page: currentPage,
      limit: 20,
      forceRefresh: true,
      ...(searchQuery && { search: searchQuery }),
      ...(filters.status && { status: filters.status }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    };

    axiosGet('/api/anime-list', { params }).then(response => {
      if (response.data.success) {
        setAnime(response.data.data.anime);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
        setSummary(response.data.data.summary || {});
      }
    });
  };

  // Debug logging
  useEffect(() => {
    console.log('Current page:', currentPage);
    console.log('Total pages:', totalPages);
    console.log('Anime count:', anime.length);
  }, [currentPage, totalPages, anime.length]);

  if (loading && anime.length === 0) {
    return <LoadingSpinner />;
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-4">
          Katalog Anime
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Jelajahi koleksi anime terlengkap dengan berbagai genre dan kategori.
          Temukan anime favorit Anda dengan mudah.
        </p>
      </div>

      {/* Summary Stats */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {summary.totalAnime || totalItems || 0}
            </div>
            <div className="text-sm text-dark-300">Total Anime</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {anime.length}
            </div>
            <div className="text-sm text-dark-300">Ditampilkan</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleDateString('id-ID') : 'N/A'}
            </div>
            <div className="text-sm text-dark-300">Update Terakhir</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pr-12"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-primary-400"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button
              onClick={handleForceRefresh}
              className="btn-secondary flex items-center space-x-2"
              title="Refresh data dari sumber"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            {(filters.status || searchQuery) && (
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>

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

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Semua Status</option>
                  <option value="ongoing">Sedang Tayang</option>
                  <option value="completed">Selesai</option>
                  <option value="upcoming">Akan Datang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="title">Judul</option>
                  <option value="rating">Rating</option>
                  <option value="createdAt">Tanggal Ditambahkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Urutan
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Semua Anime'}
          </h2>
          {anime.length > 0 && (
            <span className="text-dark-300">({anime.length} dari {totalItems} anime)</span>
          )}
        </div>
        {/* Debug info */}
        <div className="text-xs text-dark-400">
          Halaman {currentPage} dari {totalPages}
        </div>
      </div>

      {/* Anime Grid/List */}
      {anime.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {anime.map((animeItem) => (
              <AnimeListCard key={animeItem.id} anime={animeItem} viewMode={viewMode} />
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
          <div className="text-dark-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Hasil</h3>
          <p className="text-dark-300 mb-6">
            {searchQuery 
              ? `Tidak ditemukan anime dengan kata kunci "${searchQuery}"`
              : 'Belum ada anime yang tersedia'
            }
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Lihat Semua Anime
          </button>
        </div>
      )}

      {/* Loading More */}
      {loading && anime.length > 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
