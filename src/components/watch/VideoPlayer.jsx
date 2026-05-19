import { useEffect, useRef, useState } from 'react';

/**
 * VideoPlayer — Self-contained YouTube IFrame API player.
 *
 * Props:
 *  - currentTopic   : { videoId, start, end, id, title }
 *  - onTopicComplete: (topicId) => void  — called when end time hit
 *  - onNextTopic    : ()        => void  — called 3 s after complete
 *
 * KEY FIX NOTES:
 *  ─────────────────────────────────────────────────────────────────
 *  1. Topics now carry videoId propagated from their parent section
 *     (via courseData.js allTopics helper), so video switching works.
 *
 *  2. extractVideoId() strips ?si= tracking params and any other junk
 *     from YouTube URLs — only the clean 11-char ID is used.
 *
 *  3. enablejsapi=1 and origin are ALWAYS set in playerVars.
 *
 *  4. Error state shows a fallback UI with a retry/skip button.
 *
 *  5. loadVideoById() for different videos; seekTo() for same video.
 *  ─────────────────────────────────────────────────────────────────
 */

// ── Utility: extract a clean 11-char YouTube video ID ──────────
const extractVideoId = (input) => {
  if (!input) return null;

  // Already a clean 11-char ID (no slashes, dots, or query strings)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // Handle all YouTube URL formats and strip ?si= / other params
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }

  return null;
};

// ── Default fallback video IDs ─────────────────────────────────
const DEFAULT_VIDEO_ID = 'HcOc7P5BMi4'; // HTML video

const VideoPlayer = ({ currentTopic, onTopicComplete, onNextTopic }) => {
  // ── Refs (always hold latest values — no stale closures) ──────
  const playerRef       = useRef(null);   // YT.Player instance
  const isReadyRef      = useRef(false);  // true once onReady fires
  const intervalRef     = useRef(null);   // end-time polling interval
  const nextTimerRef    = useRef(null);   // 3-s auto-next timer
  const topicRef        = useRef(currentTopic);
  const onCompleteRef   = useRef(onTopicComplete);
  const onNextRef       = useRef(onNextTopic);

  // ── Error state ──────────────────────────────────────────────
  const [playerError, setPlayerError] = useState(false);

  // Keep refs in sync with latest props (runs every render)
  useEffect(() => { topicRef.current      = currentTopic;   }, [currentTopic]);
  useEffect(() => { onCompleteRef.current = onTopicComplete; }, [onTopicComplete]);
  useEffect(() => { onNextRef.current     = onNextTopic;     }, [onNextTopic]);

  // ── Helpers (plain functions — read from refs, never go stale) ─

  /** Stop end-time polling and cancel auto-next timer */
  const clearEndChecker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  };

  /** Start polling player time; fire complete + auto-next when end hit */
  const startEndChecker = (topic) => {
    clearEndChecker();
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      try {
        const time = player.getCurrentTime();
        if (time >= topic.end - 1) {
          clearEndChecker();
          player.pauseVideo?.();
          onCompleteRef.current?.(topic.id);
          nextTimerRef.current = setTimeout(() => {
            onNextRef.current?.();
          }, 3000);
        }
      } catch {
        // Player may have been destroyed — just clear and stop
        clearEndChecker();
      }
    }, 1000);
  };

  /** Handle YT player state changes */
  const onPlayerStateChange = (event) => {
    const topic = topicRef.current;
    if (!topic) return;
    if (event.data === window.YT?.PlayerState?.PAUSED) {
      clearEndChecker();
    }
    if (event.data === window.YT?.PlayerState?.PLAYING) {
      setPlayerError(false); // Clear error if playback resumes
      startEndChecker(topic);
    }
  };

  /** Handle YT player errors */
  const onPlayerError = (event) => {
    console.error('YouTube Player Error Code:', event.data);
    // Error codes: 2=bad param, 5=HTML5 error, 100=not found, 101/150=restricted
    setPlayerError(true);
  };

  /** Create the YT.Player instance (called once when API is ready) */
  const initPlayer = () => {
    // Safety: the DOM element must exist
    const container = document.getElementById('yt-player-div');
    if (!container) {
      // If DOM isn't ready yet, retry once after a short delay
      setTimeout(() => {
        if (document.getElementById('yt-player-div') && !playerRef.current) {
          initPlayer();
        }
      }, 200);
      return;
    }

    // If player already exists and is valid, skip
    if (playerRef.current) {
      try {
        // Test if the player is still alive
        playerRef.current.getPlayerState?.();
        return; // It's alive — don't re-init
      } catch {
        // Player is dead/destroyed — allow re-init
        playerRef.current = null;
        isReadyRef.current = false;
      }
    }

    const topic = topicRef.current;
    // ALWAYS extract clean video ID — strips ?si= and other tracking params
    const cleanVideoId = extractVideoId(topic?.videoId) || DEFAULT_VIDEO_ID;

    playerRef.current = new window.YT.Player('yt-player-div', {
      height: '100%',
      width:  '100%',
      videoId: cleanVideoId,
      playerVars: {
        enablejsapi:    1,                      // MANDATORY for JS control
        autoplay:       1,
        rel:            0,
        modestbranding: 1,
        start:          topic?.start || 0,
        origin:         window.location.origin,  // MANDATORY — prevents CORS block
        iv_load_policy: 3,                       // hide annotations
        cc_load_policy: 0,
        // NEVER include: si, feature, or share params
      },
      events: {
        onReady: (event) => {
          isReadyRef.current = true;
          setPlayerError(false);
          const t = topicRef.current;
          // playerVars.start is approximate; seekTo is exact
          event.target.seekTo(t?.start || 0, true);
          event.target.playVideo();
          if (t) startEndChecker(t);
        },
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  // ── Load YouTube IFrame API script (ONCE on mount) ────────────

  useEffect(() => {
    // If API is already fully loaded, init player immediately
    if (window.YT && window.YT.Player) {
      // Use a microtask so the div is definitely in the DOM
      setTimeout(initPlayer, 0);
      return;
    }

    // Set the global callback BEFORE injecting the script.
    // The script calls window.onYouTubeIframeAPIReady() when ready.
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    // Inject the API script only once (guard by element id)
    if (!document.getElementById('youtube-api-script')) {
      const script  = document.createElement('script');
      script.id     = 'youtube-api-script';
      script.src    = 'https://www.youtube.com/iframe_api';
      script.async  = true;
      // YouTube recommends inserting before the first existing <script>
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    } else {
      // Script tag exists but API not yet loaded —
      // it will fire onYouTubeIframeAPIReady when done.
      // But if it already fired and we missed it (e.g. HMR),
      // poll briefly to catch it:
      const poll = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(poll);
          initPlayer();
        }
      }, 100);
      // Give up after 10 seconds
      setTimeout(() => clearInterval(poll), 10000);
    }

    // Cleanup on unmount
    return () => {
      clearEndChecker();
      // Don't destroy the player here — React may re-mount in
      // Strict Mode and the div is about to be removed anyway.
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to currentTopic prop changes ────────────────────────

  useEffect(() => {
    if (!currentTopic) return;
    if (!isReadyRef.current || !playerRef.current) return;

    clearEndChecker();
    setPlayerError(false);
    const player = playerRef.current;

    // ALWAYS extract clean video ID — strips ?si= and other params
    const newVideoId = extractVideoId(currentTopic.videoId) || DEFAULT_VIDEO_ID;

    // Detect whether we need to swap the entire video
    let currentVideoId = null;
    try {
      currentVideoId = player.getVideoData?.()?.video_id || null;
    } catch {
      // Player may have been destroyed
      return;
    }

    if (currentVideoId && currentVideoId !== newVideoId) {
      // ── Different video → loadVideoById ──
      player.loadVideoById({
        videoId:      newVideoId,
        startSeconds: currentTopic.start,
      });
      // End checker starts automatically via onStateChange → PLAYING
    } else {
      // ── Same video → seekTo + playVideo ──
      player.seekTo(currentTopic.start, true);
      player.playVideo();
      startEndChecker(currentTopic);
    }
  }, [currentTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry handler ─────────────────────────────────────────────
  const handleRetry = () => {
    setPlayerError(false);
    if (playerRef.current) {
      try {
        const topic = topicRef.current;
        const cleanId = extractVideoId(topic?.videoId) || DEFAULT_VIDEO_ID;
        playerRef.current.loadVideoById({
          videoId: cleanId,
          startSeconds: topic?.start || 0,
        });
      } catch {
        // If player is dead, re-init
        playerRef.current = null;
        isReadyRef.current = false;
        initPlayer();
      }
    } else {
      initPlayer();
    }
  };

  // ── JSX — div MUST always be in DOM (never conditional) ───────

  return (
    <div
      style={{
        position:     'relative',
        width:        '100%',
        aspectRatio:  '16 / 9',
        background:   '#000',
        borderRadius: '8px',
        overflow:     'hidden',
      }}
    >
      {/* This div is replaced in-place by the YT.Player constructor.
          It must ALWAYS be rendered — never conditionally. */}
      <div
        id="yt-player-div"
        style={{
          width: '100%',
          height: '100%',
          // Hide the player when error is shown, but keep it in DOM
          ...(playerError ? { position: 'absolute', opacity: 0, pointerEvents: 'none' } : {}),
        }}
      />

      {/* Error overlay */}
      {playerError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            zIndex: 10,
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>Video unavailable</p>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '280px', textAlign: 'center' }}>
            There was an error loading this video. Try again or skip to the next topic.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={handleRetry}
              style={{
                padding: '8px 20px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              🔄 Retry
            </button>
            <button
              onClick={() => onNextRef.current?.()}
              style={{
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Skip to Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
