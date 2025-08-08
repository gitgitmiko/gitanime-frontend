import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiSearch, FiHome, FiPlay, FiSettings, FiUser } from 'react-icons/fi';
import { useConfig } from '../contexts/ConfigContext';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { config } = useConfig();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const navigation = [
    { name: 'Beranda', href: '/', icon: FiHome },
    { name: 'Anime', href: '/anime', icon: FiPlay },
    { name: 'Terbaru', href: '/latest', icon: FiPlay },
    { name: 'Admin', href: '/admin', icon: FiSettings },
  ];

  return (
    <>
      <Head>
        <title>GitAnime - Streaming Anime Terbaik</title>
        <meta name="description" content="Nonton anime subtitle Indonesia terlengkap dan terbaru" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {/* Header */}
        <header className="glass-effect sticky top-0 z-50 border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-anime rounded-lg flex items-center justify-center">
                  <FiPlay className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">GitAnime</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        router.pathname === item.href
                          ? 'text-primary-400 bg-primary-400/10'
                          : 'text-dark-300 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Cari anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-64 pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-primary-400"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-dark-700 bg-dark-800/95 backdrop-blur-sm">
              <div className="px-4 py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Cari anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-primary-400"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                </form>

                {/* Mobile Navigation Links */}
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        router.pathname === item.href
                          ? 'text-primary-400 bg-primary-400/10'
                          : 'text-dark-300 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Ads Header (if enabled) */}
        {config.enableAds && config.adsConfig.headerAd && (
          <div className="bg-dark-800 border-b border-dark-700 p-4">
            <div className="max-w-7xl mx-auto">
              <div 
                className="w-full h-16 bg-dark-700 rounded-lg flex items-center justify-center text-dark-400"
                dangerouslySetInnerHTML={{ __html: config.adsConfig.headerAd }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-dark-800 border-t border-dark-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and Description */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-anime rounded-lg flex items-center justify-center">
                    <FiPlay className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gradient">GitAnime</span>
                </div>
                <p className="text-dark-300 mb-4">
                  Platform streaming anime terbaik dengan koleksi terlengkap dan update terbaru.
                  Nikmati anime favorit Anda dengan kualitas terbaik.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-dark-300 hover:text-primary-400 transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-semibold mb-4">Info</h3>
                <ul className="space-y-2 text-dark-300">
                  <li>© 2024 GitAnime</li>
                  <li>Made with ❤️</li>
                  <li>Powered by Samehadaku</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-dark-700 mt-8 pt-8 text-center text-dark-400">
              <p>
                GitAnime tidak menyimpan file video. Semua konten berasal dari sumber eksternal.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
