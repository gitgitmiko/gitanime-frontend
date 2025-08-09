import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiSettings, FiRotateCw } from 'react-icons/fi';

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

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (videoUrl) {
      setError(null);
      setPlaying(false);
      setPlayed(0);
      setPlaybackRate(1);
      setShowSettings(false);
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
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    const newTime = parseFloat(e.target.value);
    setPlayed(newTime);
    // Seek player to new position
    try {
      if (playerRef.current) {
        playerRef.current.seekTo(newTime, 'fraction');
      }
    } catch (_) {}
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
    setLoaded(state.loaded);
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
      setIsFullscreen(Boolean(fsElement));
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
    >
      {/* Aspect ratio wrapper */}
      <div className="relative pt-[56.25%]">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={muted ? 0 : volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous',
                playsInline: true,
                controlsList: 'nodownload'
              }
            }
          }}
        />

        {/* Custom Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onPointerDown={handleSeekMouseDown}
                onPointerUp={handleSeekMouseUp}
                onChange={handleSeek}
                className="w-full h-1.5 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
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
                  />
                </div>

                {/* Time Display */}
                <div className="text-white text-xs sm:text-sm">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Settings Button */}
                <button onClick={handleSettingsClick} className="text-white hover:text-primary-400 transition-colors duration-200">
                  <FiSettings className="w-5 h-5" />
                </button>

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
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4">
          <h3 className="text-white text-sm sm:text-base font-medium text-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
