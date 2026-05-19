import { useState, useRef, useCallback, useEffect } from 'react';

const useVideoPlayer = ({ onLectureComplete, onTimeUpdate } = {}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasReached80, setHasReached80] = useState(false);

  // Sync volume/mute/speed to video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((delta) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + delta));
  }, []);

  const seekTo = useCallback((time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  const toggleMute = useCallback(() => setIsMuted((p) => !p), []);

  const changeVolume = useCallback((delta) => {
    setVolume((v) => Math.max(0, Math.min(1, v + delta)));
  }, []);

  const changeSpeed = useCallback((speed) => setPlaybackRate(speed), []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current || document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    }
  }, []);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    setCurrentTime(t);
    onTimeUpdate?.(t);

    // 80% completion trigger
    if (!hasReached80 && v.duration && t / v.duration >= 0.8) {
      setHasReached80(true);
      onLectureComplete?.();
    }
  }, [hasReached80, onLectureComplete, onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onLectureComplete?.();
  }, [onLectureComplete]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handleCanPlay = useCallback(() => setIsBuffering(false), []);

  // Reset 80% flag on lecture change
  const resetCompletion = useCallback(() => {
    setHasReached80(false);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'arrowleft': e.preventDefault(); seek(-10); break;
        case 'arrowright': e.preventDefault(); seek(10); break;
        case 'arrowup': e.preventDefault(); changeVolume(0.1); break;
        case 'arrowdown': e.preventDefault(); changeVolume(-0.1); break;
        case 'm': toggleMute(); break;
        case 'f': toggleFullscreen(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, seek, changeVolume, toggleMute, toggleFullscreen]);

  // Format time helper
  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Video element props to spread
  const videoProps = {
    ref: videoRef,
    onTimeUpdate: handleTimeUpdate,
    onLoadedMetadata: handleLoadedMetadata,
    onEnded: handleEnded,
    onPlay: handlePlay,
    onPause: handlePause,
    onWaiting: handleWaiting,
    onCanPlay: handleCanPlay,
  };

  return {
    videoRef,
    containerRef,
    videoProps,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isBuffering,
    togglePlay,
    seek,
    seekTo,
    toggleMute,
    changeVolume,
    changeSpeed,
    toggleFullscreen,
    formatTime,
    resetCompletion,
  };
};

export default useVideoPlayer;
