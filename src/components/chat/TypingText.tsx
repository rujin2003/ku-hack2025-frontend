import React, { useState, useEffect, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';

interface TypingTextProps {
  content: string;
  messageId?: string;
  typingSpeed?: number;
  onComplete?: () => void;
  className?: string;
}

// Memoized typing text component - prevents re-renders from parent
const TypingText: React.FC<TypingTextProps> = memo(({
  content,
  messageId,
  typingSpeed = 6,
  onComplete,
  className = '',
}) => {
  // Refs to store stable values that don't cause re-renders
  const hasTypedRef = useRef(false);
  const finalTextRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentIdRef = useRef<string>('');
  
  // Local state only - isolated from parent
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Generate a unique ID for this content
  const contentId = messageId || `${content.slice(0, 20)}-${content.length}`;

  // Typing animation - runs ONCE on mount or when messageId changes
  useEffect(() => {
    // If we've already typed this exact content, show it immediately
    if (hasTypedRef.current && contentIdRef.current === contentId) {
      setDisplayedContent(finalTextRef.current);
      setIsComplete(true);
      setShowCursor(false);
      return;
    }

    // If this is new content, reset and start typing
    if (contentIdRef.current !== contentId) {
      hasTypedRef.current = false;
      contentIdRef.current = contentId;
    }

    // If already typed once for this content, don't restart
    if (hasTypedRef.current) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reset state for new content
    setDisplayedContent('');
    setIsComplete(false);
    setShowCursor(true);

    let index = 0;
    
    timerRef.current = setInterval(() => {
      if (index < content.length) {
        // Add multiple characters per tick for faster typing
        const charsToAdd = Math.min(3, content.length - index);
        const newContent = content.slice(0, index + charsToAdd);
        setDisplayedContent(newContent);
        index += charsToAdd;
      } else {
        // Typing complete - lock the state
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Store final text in ref (stable, doesn't trigger re-render)
        finalTextRef.current = content;
        hasTypedRef.current = true;
        
        setIsComplete(true);
        onComplete?.();
        
        // Hide cursor after brief moment
        setTimeout(() => setShowCursor(false), 500);
      }
    }, typingSpeed);

    // Cleanup on unmount only
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // Only depend on content ID, not the full content to prevent re-triggers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  // Cursor blink during typing - isolated effect
  useEffect(() => {
    if (isComplete) return;
    
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    
    return () => clearInterval(blinkInterval);
  }, [isComplete]);

  return (
    <div className={`relative ${className}`}>
      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/50 prose-pre:p-2">
        <ReactMarkdown>{displayedContent}</ReactMarkdown>
        {showCursor && !isComplete && (
          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-pulse" />
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if messageId changes
  // This prevents re-renders from parent state changes
  return prevProps.messageId === nextProps.messageId && 
         prevProps.content === nextProps.content;
});

TypingText.displayName = 'TypingText';

export default TypingText;
