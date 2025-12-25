import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, X, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface MemoizedVideoPlayerProps {
  videoUrl: string | null;
  isVideoLoading?: boolean;
  videoError?: boolean;
  onVideoRetry?: () => void;
  messageId?: string;
}

// Completely isolated video player - never triggers parent re-renders
const MemoizedVideoPlayer: React.FC<MemoizedVideoPlayerProps> = memo(({
  videoUrl,
  isVideoLoading = false,
  videoError = false,
  onVideoRetry,
}) => {
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Generate thumbnail from first frame
  useEffect(() => {
    if (!videoUrl) return;
    
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    
    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.1;
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setThumbnail(canvas.toDataURL('image/jpeg'));
      }
    });

    return () => {
      video.remove();
    };
  }, [videoUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleVideoLoaded = () => {
    setVideoReady(true);
  };

  const togglePlay = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(err => console.log('Play failed:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      const prog = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(prog) ? 0 : prog);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsPlaying(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  // Auto-hide controls - isolated state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => setShowControls(false), 2000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Sync modal video
  useEffect(() => {
    if (isFullscreen && modalVideoRef.current && videoRef.current) {
      modalVideoRef.current.currentTime = videoRef.current.currentTime;
    }
  }, [isFullscreen]);

  const renderVideoControls = (isModal = false) => (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"
        >
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => togglePlay(isModal)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center pointer-events-auto neon-glow-subtle"
            >
              <Play className="h-6 w-6 text-primary-foreground ml-1" />
            </motion.button>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-auto">
            <div className="w-full h-1 bg-muted/30 rounded-full mb-3 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePlay(isModal)}
                  className="w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMute(isModal)}
                  className="w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </motion.button>
              </div>

              {!isModal && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openFullscreen}
                  className="w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  <Maximize2 className="h-3 w-3" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const VideoLoadingPlaceholder = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="aspect-video bg-secondary/30 rounded-xl flex flex-col items-center justify-center gap-3"
    >
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 120, 240].map((rotation, i) => (
            <motion.div
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2"
              style={{ transform: `rotate(${rotation}deg) translateY(-20px)` }}
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.3 
              }}
            >
              <Sparkles className="h-3 w-3 text-primary" />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-4 h-4 rounded-full bg-primary/50" />
        </motion.div>
      </div>
      <motion.p
        className="text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Generating animation...
      </motion.p>
    </motion.div>
  );

  const VideoErrorState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="aspect-video bg-secondary/30 rounded-xl flex flex-col items-center justify-center gap-3 p-4"
    >
      <p className="text-sm text-muted-foreground text-center">Animation unavailable</p>
      {onVideoRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onVideoRetry}
          className="px-4 py-2 text-sm rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          Retry
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <>
      <div className="p-4">
        {videoError ? (
          <VideoErrorState />
        ) : isVideoLoading || !videoUrl ? (
          <VideoLoadingPlaceholder />
        ) : (
          <motion.div
            className="relative rounded-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none z-10"
              initial={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.6)' }}
              animate={{ boxShadow: '0 0 0px transparent' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />

            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnail || undefined}
              muted={isMuted}
              playsInline
              preload="auto"
              onLoadedMetadata={handleVideoLoaded}
              onTimeUpdate={() => handleTimeUpdate(false)}
              onEnded={handleVideoEnd}
              onClick={() => togglePlay(false)}
              className="w-full aspect-video bg-background/90 cursor-pointer rounded-xl"
              style={{
                opacity: videoReady ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
              }}
            />

            {!videoReady && <VideoLoadingPlaceholder />}
            {videoReady && renderVideoControls(false)}
          </motion.div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(20px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 bg-background/80"
            />

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </motion.button>

            <div className="relative z-10 w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: '0 0 60px hsl(var(--primary) / 0.3)'
                }}
              >
                <video
                  ref={modalVideoRef}
                  src={videoUrl}
                  poster={thumbnail || undefined}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onTimeUpdate={() => handleTimeUpdate(true)}
                  onEnded={handleVideoEnd}
                  onClick={() => togglePlay(true)}
                  className="w-full aspect-video bg-background/90 cursor-pointer"
                />
                {renderVideoControls(true)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if video-related props change
  return prevProps.videoUrl === nextProps.videoUrl &&
         prevProps.isVideoLoading === nextProps.isVideoLoading &&
         prevProps.videoError === nextProps.videoError &&
         prevProps.messageId === nextProps.messageId;
});

MemoizedVideoPlayer.displayName = 'MemoizedVideoPlayer';

export default MemoizedVideoPlayer;
