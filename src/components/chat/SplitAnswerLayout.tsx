import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingText from './TypingText';
import MemoizedVideoPlayer from './MemoizedVideoPlayer';

interface SplitAnswerLayoutProps {
  textContent: string;
  videoUrl: string | null;
  isVideoLoading?: boolean;
  onVideoRetry?: () => void;
  videoError?: boolean;
  messageId: string;
}

// Memoized text panel - completely isolated from video
const TextPanel = memo<{ 
  content: string; 
  messageId: string;
  showSplitLayout: boolean;
  onComplete: () => void;
}>(({ content, messageId, showSplitLayout, onComplete }) => {
  return (
    <motion.div
      className={`
        glass-strong rounded-2xl p-5 overflow-hidden
        ${showSplitLayout ? 'lg:w-1/2 w-full' : 'w-full'}
      `}
      layout
      initial={{ width: '100%' }}
      animate={{ 
        width: showSplitLayout ? undefined : '100%',
        boxShadow: '0 0 30px hsl(var(--primary) / 0.1)'
      }}
      transition={{ 
        width: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        boxShadow: { duration: 0.5, delay: 0.2 }
      }}
    >
      <TypingText
        content={content}
        messageId={messageId}
        typingSpeed={6}
        onComplete={onComplete}
      />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if messageId changes or layout changes
  return prevProps.messageId === nextProps.messageId && 
         prevProps.showSplitLayout === nextProps.showSplitLayout;
});

TextPanel.displayName = 'TextPanel';

// Memoized video panel - completely isolated from text
const VideoPanel = memo<{
  videoUrl: string | null;
  isVideoLoading: boolean;
  videoError: boolean;
  onVideoRetry?: () => void;
  messageId: string;
}>(({ videoUrl, isVideoLoading, videoError, onVideoRetry, messageId }) => {
  return (
    <motion.div
      className="lg:w-1/2 w-full"
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: 0.15,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <motion.div
        className="glass-strong rounded-2xl overflow-hidden h-full"
        initial={{ boxShadow: '0 0 0px transparent' }}
        animate={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.1)' }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <MemoizedVideoPlayer
          videoUrl={videoUrl}
          isVideoLoading={isVideoLoading}
          videoError={videoError}
          onVideoRetry={onVideoRetry}
          messageId={messageId}
        />
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return prevProps.videoUrl === nextProps.videoUrl &&
         prevProps.isVideoLoading === nextProps.isVideoLoading &&
         prevProps.videoError === nextProps.videoError &&
         prevProps.messageId === nextProps.messageId;
});

VideoPanel.displayName = 'VideoPanel';

const SplitAnswerLayout: React.FC<SplitAnswerLayoutProps> = memo(({
  textContent,
  videoUrl,
  isVideoLoading = false,
  onVideoRetry,
  videoError = false,
  messageId,
}) => {
  const [showSplitLayout, setShowSplitLayout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Animate to split layout when video is available - stable effect
  useEffect(() => {
    if (videoUrl || isVideoLoading) {
      const timer = setTimeout(() => {
        setShowSplitLayout(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoUrl, isVideoLoading]);

  // Scroll once on mount only
  useEffect(() => {
    if (containerRef.current && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Callback for text completion - using ref to prevent re-renders
  const handleTextComplete = useRef(() => {}).current;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      <motion.div
        className={`
          flex gap-4
          ${showSplitLayout ? 'flex-col lg:flex-row' : 'flex-col'}
        `}
        layout
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Left Panel - Text Explanation (Isolated) */}
        <TextPanel
          content={textContent}
          messageId={messageId}
          showSplitLayout={showSplitLayout}
          onComplete={handleTextComplete}
        />

        {/* Right Panel - Video Preview (Isolated) */}
        <AnimatePresence mode="wait">
          {showSplitLayout && (
            <VideoPanel
              videoUrl={videoUrl}
              isVideoLoading={isVideoLoading}
              videoError={videoError}
              onVideoRetry={onVideoRetry}
              messageId={messageId}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return prevProps.messageId === nextProps.messageId &&
         prevProps.textContent === nextProps.textContent &&
         prevProps.videoUrl === nextProps.videoUrl &&
         prevProps.isVideoLoading === nextProps.isVideoLoading &&
         prevProps.videoError === nextProps.videoError;
});

SplitAnswerLayout.displayName = 'SplitAnswerLayout';

export default SplitAnswerLayout;
