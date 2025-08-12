import { useState, useEffect } from 'react';
import { FiSettings, FiRefreshCw, FiSave, FiEye, FiEyeOff, FiLink, FiMonitor } from 'react-icons/fi';
import { axiosGet, axiosPost, axiosPut } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Head from 'next/head';

export default function Admin() {
  const [config, setConfig] = useState({
    samehadakuUrl: 'https://v1.samehadaku.how/',
    enableAds: false,
    adsConfig: {
      headerAd: '',
      sidebarAd: '',
      videoAd: ''
    },
    playerConfig: {
      autoplay: false,
      quality: 'auto',
      subtitle: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapingLatest, setScrapingLatest] = useState(false);
  const [scrapingAnimeList, setScrapingAnimeList] = useState(false);
  const [scrapingLatestBatch, setScrapingLatestBatch] = useState(false);
  const [scrapingAnimeListBatch, setScrapingAnimeListBatch] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    totalAnime: 'N/A',
    totalEpisodes: 'N/A',
    lastUpdate: 'N/A'
  });

  useEffect(() => {
    fetchConfig();
    // Remove fetchSystemStatus() since /api/scrape only supports POST
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axiosGet('/api/config');
      
      // Ensure all required properties exist with default values
      const fetchedConfig = response.data || {};
      setConfig({
        samehadakuUrl: fetchedConfig.samehadakuUrl || 'https://v1.samehadaku.how/',
        enableAds: fetchedConfig.enableAds || false,
        adsConfig: {
          headerAd: fetchedConfig.adsConfig?.headerAd || '',
          sidebarAd: fetchedConfig.adsConfig?.sidebarAd || '',
          videoAd: fetchedConfig.adsConfig?.videoAd || ''
        },
        playerConfig: {
          autoplay: fetchedConfig.playerConfig?.autoplay || false,
          quality: fetchedConfig.playerConfig?.quality || 'auto',
          subtitle: fetchedConfig.playerConfig?.subtitle !== undefined ? fetchedConfig.playerConfig.subtitle : true
        }
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Gagal memuat konfigurasi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password diperlukan');
      return;
    }

    try {
      // Test authentication by trying to update config with password
      await axiosPut('/api/config', {
        password: password,
        testAuth: true
      });
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setError('Password salah atau tidak memiliki akses admin');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosPut('/api/config', {
        password,
        ...config
      });
      setSuccess('Konfigurasi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosPost('/api/scrape', { password });
      setSuccess('Scraping berhasil dijalankan! Data akan diperbarui dalam beberapa menit.');
      
      // Immediately update system status with the response data
      if (response.data) {
        const { lastUpdated, summary } = response.data;
        
        // Parse anime count from summary
        let totalAnime = 'N/A';
        if (summary?.animeListScraping) {
          const animeMatch = summary.animeListScraping.match(/(\d+)\s+anime\s+found/);
          if (animeMatch) {
            totalAnime = animeMatch[1];
          }
        }
        
        // Parse episode count from summary
        let totalEpisodes = 'N/A';
        if (summary?.latestEpisodesScraping) {
          const episodeMatch = summary.latestEpisodesScraping.match(/(\d+)\s+episodes\s+found/);
          if (episodeMatch) {
            totalEpisodes = episodeMatch[1];
          }
        }
        
        // Format last update date
        let formattedLastUpdate = 'N/A';
        if (lastUpdated) {
          try {
            const date = new Date(lastUpdated);
            formattedLastUpdate = date.toLocaleString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            formattedLastUpdate = lastUpdated;
          }
        }
        
        setSystemStatus({
          totalAnime,
          totalEpisodes,
          lastUpdate: formattedLastUpdate
        });
      }
    } catch (error) {
      console.error('Error during scraping:', error);
      setError('Gagal menjalankan scraping');
    } finally {
      setScraping(false);
    }
  };

  const handleScrapeLatestEpisodes = async () => {
    setScrapingLatest(true);
    setError(null);
    setSuccess(null);
    try {
      await axiosPost('/api/scrape-latest-episodes', { password });
      setSuccess('Scraping latest episodes berhasil dijalankan!');
    } catch (error) {
      console.error('Error during scraping latest episodes:', error);
      setError('Gagal menjalankan scraping latest episodes');
    } finally {
      setScrapingLatest(false);
    }
  };

  const handleScrapeAnimeListOnly = async () => {
    setScrapingAnimeList(true);
    setError(null);
    setSuccess(null);
    try {
      await axiosPost('/api/scrape-anime-list', { password });
      setSuccess('Scraping anime list berhasil dijalankan!');
    } catch (error) {
      console.error('Error during scraping anime list:', error);
      setError('Gagal menjalankan scraping anime list');
    } finally {
      setScrapingAnimeList(false);
    }
  };

  // Batch states
  const [latestStartPage, setLatestStartPage] = useState('1');
  const [latestEndPage, setLatestEndPage] = useState('');
  const [animeStartPage, setAnimeStartPage] = useState('1');
  const [animeEndPage, setAnimeEndPage] = useState('');

  const parsePositiveInt = (value) => {
    const n = parseInt(value, 10);
    return Number.isNaN(n) || n <= 0 ? null : n;
  };

  const handleScrapeLatestEpisodesBatch = async () => {
    setScrapingLatestBatch(true);
    setError(null);
    setSuccess(null);
    try {
      const start = parsePositiveInt(latestStartPage);
      if (!start) {
        setError('Start page (latest episodes) harus angka > 0');
        setScrapingLatestBatch(false);
        return;
      }
      const end = latestEndPage ? parsePositiveInt(latestEndPage) : null;
      const payload = { password, startPage: start };
      if (end && end >= start) payload.endPage = end;
      await axiosPost('/api/scrape-latest-episodes-batch', payload);
      setSuccess('Scraping batch latest episodes dijalankan!');
    } catch (error) {
      console.error('Error during scraping latest episodes batch:', error);
      setError('Gagal menjalankan scraping batch latest episodes');
    } finally {
      setScrapingLatestBatch(false);
    }
  };

  const handleScrapeAnimeListBatch = async () => {
    setScrapingAnimeListBatch(true);
    setError(null);
    setSuccess(null);
    try {
      const start = parsePositiveInt(animeStartPage);
      if (!start) {
        setError('Start page (anime list) harus angka > 0');
        setScrapingAnimeListBatch(false);
        return;
      }
      const end = animeEndPage ? parsePositiveInt(animeEndPage) : null;
      const payload = { password, startPage: start };
      if (end && end >= start) payload.endPage = end;
      await axiosPost('/api/scrape-anime-list-batch', payload);
      setSuccess('Scraping batch anime list dijalankan!');
    } catch (error) {
      console.error('Error during scraping anime list batch:', error);
      setError('Gagal menjalankan scraping batch anime list');
    } finally {
      setScrapingAnimeListBatch(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Memuat konfigurasi..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Head>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSettings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-dark-300">Masuk untuk mengelola konfigurasi GitAnime</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Masukkan password admin"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-dark-300">Kelola konfigurasi dan pengaturan GitAnime</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="btn-secondary"
        >
          Keluar
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FiRefreshCw className="w-6 h-6 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Scraping Manual</h3>
            </div>
            <p className="text-dark-300">Gunakan aksi berikut untuk menjalankan scraping secara manual.</p>
          </div>

          {/* All-in-one */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Semua Sekaligus</h4>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="btn-primary flex items-center space-x-2"
            >
              {scraping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memulai...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Jalankan Scraping All-in-one</span>
                </>
              )}
            </button>
          </div>

          {/* Latest episodes only */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Hanya Latest Episodes</h4>
            <button
              onClick={handleScrapeLatestEpisodes}
              disabled={scrapingLatest}
              className="btn-secondary"
            >
              {scrapingLatest ? 'Memulai...' : 'Scrape Latest Episodes'}
            </button>
          </div>

          {/* Anime list only */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Hanya Anime List</h4>
            <button
              onClick={handleScrapeAnimeListOnly}
              disabled={scrapingAnimeList}
              className="btn-secondary"
            >
              {scrapingAnimeList ? 'Memulai...' : 'Scrape Anime List'}
            </button>
          </div>

          {/* Batch latest episodes */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Batch Latest Episodes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                min="1"
                value={latestStartPage}
                onChange={(e) => setLatestStartPage(e.target.value)}
                className="input-field w-full"
                placeholder="Start page"
              />
              <input
                type="number"
                min="1"
                value={latestEndPage}
                onChange={(e) => setLatestEndPage(e.target.value)}
                className="input-field w-full"
                placeholder="End page (opsional)"
              />
              <button
                onClick={handleScrapeLatestEpisodesBatch}
                disabled={scrapingLatestBatch}
                className="btn-secondary"
              >
                {scrapingLatestBatch ? 'Memulai...' : 'Jalankan Batch'}
              </button>
            </div>
          </div>

          {/* Batch anime list */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Batch Anime List</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                min="1"
                value={animeStartPage}
                onChange={(e) => setAnimeStartPage(e.target.value)}
                className="input-field w-full"
                placeholder="Start page"
              />
              <input
                type="number"
                min="1"
                value={animeEndPage}
                onChange={(e) => setAnimeEndPage(e.target.value)}
                className="input-field w-full"
                placeholder="End page (opsional)"
              />
              <button
                onClick={handleScrapeAnimeListBatch}
                disabled={scrapingAnimeListBatch}
                className="btn-secondary"
              >
                {scrapingAnimeListBatch ? 'Memulai...' : 'Jalankan Batch'}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiMonitor className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Status Sistem</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-300">Total Anime:</span>
              <span className="text-white">{systemStatus.totalAnime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Total Episode:</span>
              <span className="text-white">{systemStatus.totalEpisodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Last Update:</span>
              <span className="text-white">{systemStatus.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="space-y-8">
        {/* Samehadaku URL */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiLink className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Konfigurasi Samehadaku</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              URL Samehadaku
            </label>
            <input
              type="url"
              value={config.samehadakuUrl || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, samehadakuUrl: e.target.value }))}
              className="input-field w-full"
              placeholder="https://v1.samehadaku.how/"
              required
            />
            <p className="text-sm text-dark-300 mt-1">
              URL website samehadaku yang akan di-scrape
            </p>
          </div>
        </div>

        {/* Ads Configuration */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiEye className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Konfigurasi Iklan</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableAds"
                checked={config.enableAds || false}
                onChange={(e) => setConfig(prev => ({ ...prev, enableAds: e.target.checked }))}
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="enableAds" className="text-white">
                Aktifkan Iklan
              </label>
            </div>

            {(config.enableAds || false) && (
              <div className="space-y-4 pl-7">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Header Ad (HTML)
                  </label>
                  <textarea
                    value={config.adsConfig?.headerAd || ''}
                    onChange={(e) => handleInputChange('adsConfig', 'headerAd', e.target.value)}
                    className="input-field w-full h-20"
                    placeholder="<div>Header Advertisement</div>"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Sidebar Ad (HTML)
                  </label>
                  <textarea
                    value={config.adsConfig?.sidebarAd || ''}
                    onChange={(e) => handleInputChange('adsConfig', 'sidebarAd', e.target.value)}
                    className="input-field w-full h-20"
                    placeholder="<div>Sidebar Advertisement</div>"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Video Ad (HTML)
                  </label>
                  <textarea
                    value={config.adsConfig?.videoAd || ''}
                    onChange={(e) => handleInputChange('adsConfig', 'videoAd', e.target.value)}
                    className="input-field w-full h-20"
                    placeholder="<div>Video Advertisement</div>"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player Configuration */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiSettings className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Konfigurasi Player</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Autoplay
              </label>
              <select
                value={(config.playerConfig?.autoplay || false) ? 'true' : 'false'}
                onChange={(e) => handleInputChange('playerConfig', 'autoplay', e.target.value === 'true')}
                className="input-field w-full"
              >
                <option value="false">Tidak</option>
                <option value="true">Ya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Kualitas Default
              </label>
              <select
                value={config.playerConfig?.quality || 'auto'}
                onChange={(e) => handleInputChange('playerConfig', 'quality', e.target.value)}
                className="input-field w-full"
              >
                <option value="auto">Auto</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Subtitle
              </label>
              <select
                value={(config.playerConfig?.subtitle !== undefined ? config.playerConfig.subtitle : true) ? 'true' : 'false'}
                onChange={(e) => handleInputChange('playerConfig', 'subtitle', e.target.value === 'true')}
                className="input-field w-full"
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Simpan Konfigurasi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
