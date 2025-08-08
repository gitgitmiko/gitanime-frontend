import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiSettings } from 'react-icons/fi';

export default function VideoPlayer({ videoUrl, title }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoUrl) {
      setError(null);
      setPlaying(false);
      setPlayed(0);
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
      className="video-player relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        url={videoUrl}
        playing={playing}
        volume={muted ? 0 : volume}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onError={handleError}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous"
            }
          }
        }}
      />

      {/* Custom Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onChange={handleSeek}
              className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-primary-400 transition-colors duration-200"
              >
                {playing ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
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
                  className="w-20 h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings Button */}
              <button className="text-white hover:text-primary-400 transition-colors duration-200">
                <FiSettings className="w-5 h-5" />
              </button>

              {/* Fullscreen Button */}
              <button className="text-white hover:text-primary-400 transition-colors duration-200">
                <FiMaximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!playing && !error && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200"
          >
            <FiPlay className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Title Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <h3 className="text-white font-medium text-shadow-lg">
          {title}
        </h3>
      </div>
    </div>
  );
}
