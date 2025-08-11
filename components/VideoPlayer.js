import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiSettings, FiRotateCw, FiChevronLeft, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function VideoPlayer({ videoUrl, title, onOpenSettings }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [fitContain, setFitContain] = useState(true); // Fullscreen: default FIT to avoid crop

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const lastSeekFractionRef = useRef(null);

  useEffect(() => {
    if (videoUrl) {
      setError(null);
      setPlaying(false);
      setPlayed(0);
      setPlaybackRate(1);
      setShowSettings(false);
      setSeeking(false);
      lastSeekFractionRef.current = null;
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setPlayed(newTime);
    setSeeking(true);
    lastSeekFractionRef.current = newTime;
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    const newTime = parseFloat(e.target.value);
    setPlayed(newTime);
    setSeeking(false);
    
    // Seek player to new position
    try {
      if (playerRef.current) {
        console.log('Seeking to:', newTime, 'fraction');
        playerRef.current.seekTo(newTime, 'fraction');
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  // Tambahkan handler untuk seek sambil drag
  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setPlayed(newTime);
    // Update seeking state untuk mencegah conflict dengan onProgress
    setSeeking(true);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
    setLoaded(state.loaded);
    
    // Debug: log progress untuk troubleshooting
    if (seeking) {
      console.log('Progress blocked by seeking state');
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleError = (error) => {
    console.error('Video player error:', error);
    setError('Gagal memuat video. Silakan coba lagi.');
  };

  // Paksa object-fit pada elemen <video> internal ReactPlayer
  const applyVideoObjectFit = useCallback(() => {
    try {
      const internal = playerRef.current && typeof playerRef.current.getInternalPlayer === 'function'
        ? playerRef.current.getInternalPlayer()
        : null;
      if (internal && internal.tagName && internal.tagName.toLowerCase() === 'video') {
        internal.style.objectFit = isFullscreen && fitContain ? 'contain' : 'cover';
        internal.style.width = '100%';
        internal.style.height = '100%';
      }
    } catch (_) {}
  }, [isFullscreen, fitContain]);

  // Auto-hide controls on mobile while playing
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (playing) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [playing]);

  useEffect(() => {
    const onFsChange = () => {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      const nowFullscreen = Boolean(fsElement);
      setIsFullscreen(nowFullscreen);
      // Tampilkan kontrol sementara saat masuk fullscreen agar tombol Back terlihat
      if (nowFullscreen) {
        setFitContain(true); // default ke FIT saat masuk fullscreen
        setShowControls(true);
        if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
        if (playing) {
          hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
        }
        // Terapkan ulang object-fit saat masuk fullscreen
        setTimeout(applyVideoObjectFit, 0);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, []);

  // Terapkan ulang object-fit saat toggle Fit/Fill atau perubahan fullscreen
  useEffect(() => {
    applyVideoObjectFit();
  }, [applyVideoObjectFit]);

  // Saat fullscreen, dengarkan pointer di dokumen agar tap dimana saja memunculkan kontrol
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = () => showControlsTemporarily();
    document.addEventListener('pointerdown', handler, { passive: true });
    document.addEventListener('pointermove', handler, { passive: true });
    document.addEventListener('click', handler, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('pointermove', handler);
      document.removeEventListener('click', handler);
    };
  }, [isFullscreen, showControlsTemporarily]);

  const enterFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch (_) {}
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
    } catch (_) {}
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) await exitFullscreen();
    else await enterFullscreen();
  };

  const toggleLandscape = async () => {
    try {
      // Most browsers require fullscreen before locking orientation
      if (!isFullscreen) await enterFullscreen();
      if (screen.orientation && screen.orientation.lock) {
        const isLandscape = screen.orientation.type.startsWith('landscape');
        await screen.orientation.lock(isLandscape ? 'portrait' : 'landscape');
      }
    } catch (e) {
      // Silently ignore if not supported
    }
  };

  const handleSettingsClick = () => {
    if (typeof onOpenSettings === 'function') {
      onOpenSettings();
      setShowSettings(false);
    } else {
      setShowSettings((s) => !s);
    }
  };

  if (!videoUrl) {
    return (
      <div className="video-player flex items-center justify-center bg-dark-800 rounded-lg">
        <div className="text-center">
          <div className="text-dark-400 text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Video Tidak Tersedia</h3>
          <p className="text-dark-300">Video untuk episode ini belum tersedia atau sedang dalam proses update.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player flex items-center justify-center bg-dark-800 rounded-lg">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-dark-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="video-player w-full rounded-lg overflow-hidden bg-black select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={showControlsTemporarily}
      onPointerDown={showControlsTemporarily}
      onPointerMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {/* Aspect ratio wrapper */}
      <div
        className="relative"
        style={{ paddingTop: isFullscreen ? 0 : '56.25%', height: isFullscreen ? '100%' : undefined }}
      >
        {/* Back button overlay (mobile-friendly). Muncul saat fullscreen dan controls terlihat */}
        {isFullscreen && showControls && (
          <div className="absolute top-3 left-3 z-30">
            <button
              onClick={async () => {
                if (isFullscreen) {
                  await exitFullscreen();
                } else if (window.history && window.history.length > 1) {
                  window.history.back();
                }
              }}
              className="flex items-center space-x-2 bg-black/60 hover:bg-black/70 text-white px-3 py-2 rounded-md"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm">Kembali</span>
            </button>
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={muted ? 0 : volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          onReady={() => {
            applyVideoObjectFit();
          }}
          onSeek={(seconds) => {
            // Sync slider after programmatic seek
            if (duration > 0 && typeof seconds === 'number') {
              const fraction = seconds / duration;
              if (!Number.isNaN(fraction)) {
                setPlayed(Math.max(0, Math.min(1, fraction)));
                // Reset seeking state setelah seek selesai
                setSeeking(false);
              }
            }
          }}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              forceVideo: true,
              attributes: {
                crossOrigin: 'anonymous',
                playsInline: true,
                controlsList: 'nodownload',
                preload: 'metadata',
                style: {
                  objectFit: isFullscreen && fitContain ? 'contain' : 'cover',
                  width: '100%',
                  height: '100%'
                }
              }
            },
            hlsOptions: {
              lowLatencyMode: true,
              backBufferLength: 30,
              maxLiveSyncPlaybackRate: 1.2,
              liveSyncDurationCount: 2,
              enableWorker: true,
              fragLoadingTimeOut: 20000,
              manifestLoadingTimeOut: 20000
            }
          }}
          progressInterval={250}
        />

        {/* Custom Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 z-20">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4 select-none">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onPointerDown={handleSeekMouseDown}
                onPointerUp={handleSeekMouseUp}
                onChange={handleSeek}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onMouseMove={handleSeekChange}
                onTouchMove={handleSeekChange}
                onTouchEnd={handleSeekMouseUp}
                className="w-full h-1.5 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ pointerEvents: 'auto', touchAction: 'none' }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-primary-400 transition-colors duration-200"
                >
                  {playing ? <FiPause className="w-7 h-7" /> : <FiPlay className="w-7 h-7" />}
                </button>

                {/* Volume Control */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={handleToggleMute}
                    className="text-white hover:text-primary-400 transition-colors duration-200"
                  >
                    {muted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>

                {/* Time Display */}
                <div className="text-white text-xs sm:text-sm">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Fit/Fill Toggle (hanya tampil saat fullscreen) */}
                {isFullscreen && (
                  <button
                    onClick={() => {
                      setFitContain((v) => !v);
                      // Setelah toggle, paksa apply ke elemen video
                      setTimeout(() => applyVideoObjectFit(), 0);
                    }}
                    className="text-white hover:text-primary-400 transition-colors duration-200 flex items-center space-x-1"
                  >
                    {fitContain ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                    <span className="hidden sm:inline text-xs">{fitContain ? 'Fit' : 'Fill'}</span>
                  </button>
                )}

                {/* Settings Button */}
                <button onClick={handleSettingsClick} className="text-white hover:text-primary-400 transition-colors duration-200">
                  <FiSettings className="w-5 h-5" />
                </button>

                {/* Bypass Proxy removed */}

                {/* Rotate Button (Landscape lock) */}
                <button onClick={toggleLandscape} className="text-white hover:text-primary-400 transition-colors duration-200">
                  <FiRotateCw className="w-5 h-5" />
                </button>

                {/* Fullscreen Button */}
                <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors duration-200">
                  <FiMaximize className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inline Settings (playback rate) if onOpenSettings not provided */}
            {showSettings && !onOpenSettings && (
              <div className="mt-3 sm:mt-4 bg-black/70 border border-dark-600 rounded-lg p-2 inline-flex items-center space-x-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-1 rounded text-xs sm:text-sm ${playbackRate === rate ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-200 hover:bg-dark-600'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tap-to-play overlay for mobile */}
        {!playing && !error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={() => { setPlaying(true); showControlsTemporarily(); }}
              className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200"
            >
              <FiPlay className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20">
          <h3 className="text-white text-sm sm:text-base font-medium text-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
