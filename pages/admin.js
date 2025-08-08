import { useState, useEffect } from 'react';
import { FiSettings, FiRefreshCw, FiSave, FiEye, FiEyeOff, FiLink, FiMonitor } from 'react-icons/fi';
import { axiosGet, axiosPost, axiosPut } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    totalAnime: 'Loading...',
    totalEpisodes: 'Loading...',
    lastUpdate: 'Loading...'
  });

  useEffect(() => {
    fetchConfig();
    fetchSystemStatus();
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

  const fetchSystemStatus = async () => {
    try {
      const response = await axiosGet('/api/scrape');
      
      if (response.data) {
        // Extract data from the response
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
      console.error('Error fetching system status:', error);
      setSystemStatus({
        totalAnime: 'Error',
        totalEpisodes: 'Error',
        lastUpdate: 'Error'
      });
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
      await axiosPost('/api/scrape', { password });
      setSuccess('Scraping berhasil dijalankan! Data akan diperbarui dalam beberapa menit.');
      // Refresh system status after scraping
      setTimeout(() => {
        fetchSystemStatus();
      }, 2000);
    } catch (error) {
      console.error('Error during scraping:', error);
      setError('Gagal menjalankan scraping');
    } finally {
      setScraping(false);
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
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiRefreshCw className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Scraping Manual</h3>
          </div>
          <p className="text-dark-300 mb-4">
            Jalankan scraping manual untuk memperbarui data anime dari samehadaku.
          </p>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="btn-primary flex items-center space-x-2"
          >
            {scraping ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="w-4 h-4" />
                <span>Jalankan Scraping</span>
              </>
            )}
          </button>
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
          <button
            onClick={fetchSystemStatus}
            className="btn-secondary mt-4 w-full flex items-center justify-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
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
