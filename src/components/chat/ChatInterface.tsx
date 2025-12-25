import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Calculator, Atom, Zap, LineChart, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, AppMode } from '@/stores/appStore';
import { setSubject, getRouterResponse, getLLMResponse, generateManimVideo } from '@/lib/api';
import { 
  MessageLoader, 
  AnimationLoader,
  SubjectSwitchLoader, 
  ContainerRipple, 
  EdgeGlow, 
  SendButtonLoader,
  ErrorMessage,
  VideoErrorMessage,
} from './LoadingIndicators';
import ManimVideoPlayer from './ManimVideoPlayer';

interface ChatInterfaceProps {
  onModeChange: (mode: AppMode) => void;
}

interface VideoMessage {
  id: string;
  videoUrl: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onModeChange }) => {
  const { messages, isTyping, addMessage, clearMessages, setIsTyping, mode } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [promptText, setPromptText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  const [isLatexMode, setIsLatexMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('chatExpanded') === 'true';
  });
  const [isSwitchingSubject, setIsSwitchingSubject] = useState(false);
  const [switchingModeId, setSwitchingModeId] = useState<AppMode | null>(null);
  const [showContainerRipple, setShowContainerRipple] = useState(false);
  const [isLongWait, setIsLongWait] = useState(false);
  const [showError, setShowError] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const [videoMessages, setVideoMessages] = useState<VideoMessage[]>([]);
  const [showVideoError, setShowVideoError] = useState(false);
  const [pendingManimPrompt, setPendingManimPrompt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longWaitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fullPromptText = 'Ask me anything about Physics or Math!';

  // Typing animation for prompt text - plays on every page load
  useEffect(() => {
    setPromptText('');
    setTypingComplete(false);
    setShowCursor(true);
    
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullPromptText.length) {
        setPromptText(fullPromptText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true);
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 60);

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blink during typing
  useEffect(() => {
    if (typingComplete) return;
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, [typingComplete]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showError, isGeneratingAnimation, videoMessages]);

  // Cleanup long wait timer
  useEffect(() => {
    return () => {
      if (longWaitTimerRef.current) {
        clearTimeout(longWaitTimerRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Handle mode change with API call for Math/Physics
  const handleModeSwitch = useCallback(async (newMode: AppMode) => {
    // For Electrical and Graphs, just switch without API call
    if (newMode === 'electrical' || newMode === 'graphs') {
      onModeChange(newMode);
      return;
    }

    // For Math/Physics, call the subject API and clear chat history
    if (newMode === 'math' || newMode === 'physics') {
      // Only proceed if switching to a different mode
      if (newMode === mode) return;
      
      setIsSwitchingSubject(true);
      setSwitchingModeId(newMode);
      setShowContainerRipple(true);

      // Clear chat history when switching between Math/Physics
      clearMessages();
      setShowError(false);
      setVideoMessages([]);
      setShowVideoError(false);

      try {
        const subject = newMode === 'math' ? 'mathematics' : 'physics';
        await setSubject(subject);
        onModeChange(newMode);
      } catch (error) {
        console.error('Failed to switch subject:', error);
        // Still switch mode even if API fails
        onModeChange(newMode);
      } finally {
        setIsSwitchingSubject(false);
        setSwitchingModeId(null);
        setTimeout(() => setShowContainerRipple(false), 500);
      }
    }
  }, [onModeChange, mode, clearMessages]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    clearMessages();
    setShowError(false);
    setVideoMessages([]);
    setShowVideoError(false);
    setIsExpanded(false);
    localStorage.setItem('chatExpanded', 'false');
  }, [clearMessages]);

  // Generate Manim video
  const generateVideo = useCallback(async (manimPrompt: string) => {
    setIsGeneratingAnimation(true);
    setShowVideoError(false);
    
    try {
      const videoUrl = await generateManimVideo(manimPrompt);
      const videoId = `video-${Date.now()}`;
      setVideoMessages(prev => [...prev, { id: videoId, videoUrl }]);
    } catch (error) {
      console.error('Manim video generation error:', error);
      setShowVideoError(true);
      setPendingManimPrompt(manimPrompt);
    } finally {
      setIsGeneratingAnimation(false);
    }
  }, []);

  // Retry video generation
  const handleRetryVideo = useCallback(() => {
    if (pendingManimPrompt) {
      generateVideo(pendingManimPrompt);
    }
  }, [pendingManimPrompt, generateVideo]);

  // Process chat message through router and LLM
  const processMessage = useCallback(async (question: string) => {
    setShowError(false);
    setShowVideoError(false);
    setVideoMessages([]);
    setIsTyping(true);
    setIsLongWait(false);

    // Start long wait timer (3 seconds)
    longWaitTimerRef.current = setTimeout(() => {
      setIsLongWait(true);
    }, 3000);

    try {
      // Step 1: Get router response
      const routerResponse = await getRouterResponse(question);
      const { explanation_needed, visualization_needed, manim_prompt } = routerResponse.response;
      
      // Step 2: Handle based on routing logic
      if (explanation_needed) {
        // Get LLM response for explanation
        const llmResponse = await getLLMResponse(question);
        
        addMessage({
          role: 'assistant',
          content: llmResponse.llm_response,
        });
        
        // Step 3: If visualization is also needed, generate video after text
        if (visualization_needed && manim_prompt) {
          // Clear typing state before starting animation
          setIsTyping(false);
          if (longWaitTimerRef.current) {
            clearTimeout(longWaitTimerRef.current);
          }
          setIsLongWait(false);
          
          // Generate video
          await generateVideo(manim_prompt);
        }
      } else if (visualization_needed && manim_prompt) {
        // Only visualization needed, no text explanation
        setIsTyping(false);
        if (longWaitTimerRef.current) {
          clearTimeout(longWaitTimerRef.current);
        }
        setIsLongWait(false);
        
        // Generate video directly
        await generateVideo(manim_prompt);
      } else {
        // Fallback response
        addMessage({
          role: 'assistant',
          content: JSON.stringify(routerResponse.response),
        });
      }
    } catch (error) {
      console.error('Chat processing error:', error);
      setShowError(true);
    } finally {
      if (longWaitTimerRef.current) {
        clearTimeout(longWaitTimerRef.current);
      }
      setIsTyping(false);
      setIsLongWait(false);
    }
  }, [addMessage, setIsTyping, generateVideo]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isTyping || isGeneratingAnimation) return;
    
    // Expand on first message
    if (!isExpanded) {
      setIsExpanded(true);
      localStorage.setItem('chatExpanded', 'true');
    }
    
    const question = inputValue.trim();
    setLastQuestion(question);
    addMessage({ role: 'user', content: question });
    setInputValue('');
    
    // Process through API
    processMessage(question);
  }, [inputValue, isTyping, isGeneratingAnimation, isExpanded, addMessage, processMessage]);

  const handleRetry = useCallback(() => {
    if (lastQuestion) {
      processMessage(lastQuestion);
    }
  }, [lastQuestion, processMessage]);

  const modes: { id: AppMode; label: string; icon: React.ElementType }[] = [
    { id: 'math', label: 'Math', icon: Calculator },
    { id: 'physics', label: 'Physics', icon: Atom },
    { id: 'electrical', label: 'Electrical', icon: Zap },
    { id: 'graphs', label: 'Graphs', icon: LineChart },
  ];

  const isProcessing = isTyping || isGeneratingAnimation;

  return (
    <div className={`flex flex-col items-center min-h-screen p-4 transition-all duration-500 ${
      isExpanded ? 'justify-start pt-20' : 'justify-center'
    }`}>
      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 right-6 z-50"
        layout
      >
        <div className="glass rounded-full p-1 flex gap-1">
          {modes.map((m) => (
            <div key={m.id} className="relative">
              <Button
                variant={mode === m.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeSwitch(m.id)}
                disabled={isSwitchingSubject || isProcessing}
                className={`rounded-full gap-2 transition-all ${
                  mode === m.id ? 'neon-glow-subtle' : ''
                }`}
              >
                <m.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{m.label}</span>
              </Button>
              <AnimatePresence>
                <SubjectSwitchLoader isActive={switchingModeId === m.id} />
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* New Chat Button - Fixed top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed top-6 left-6 z-50"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          disabled={isSwitchingSubject || isProcessing || (messages.length === 0 && videoMessages.length === 0)}
          className="rounded-full gap-2 glass border-border/50 hover:border-primary/50 transition-all"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </motion.div>

      {/* Chat Container - Animated entrance on every page load */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          width: '100%',
          maxWidth: isExpanded ? '1200px' : '768px',
        }}
        transition={{ 
          opacity: { duration: 0.5, ease: 'easeOut' },
          scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
          width: { type: 'spring', stiffness: 200, damping: 25 },
          maxWidth: { type: 'spring', stiffness: 200, damping: 25 },
        }}
        layout
        className="w-full"
      >
        <motion.div 
          className="glass-strong rounded-3xl overflow-hidden relative"
          initial={{ boxShadow: '0 0 0px hsl(var(--primary) / 0)' }}
          animate={{
            boxShadow: isExpanded 
              ? '0 0 60px hsl(var(--primary) / 0.15), 0 0 120px hsl(var(--primary) / 0.08)'
              : '0 0 30px hsl(var(--primary) / 0.12), 0 0 60px hsl(var(--primary) / 0.06)',
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 150, 
            damping: 20,
            delay: 0.2
          }}
        >
          {/* Subject switch ripple effect */}
          <AnimatePresence>
            <ContainerRipple isActive={showContainerRipple} />
          </AnimatePresence>

          {/* Long wait edge glow */}
          <AnimatePresence>
            <EdgeGlow isActive={isLongWait} />
          </AnimatePresence>

          {/* Messages Area */}
          <motion.div 
            className="overflow-y-auto p-6 space-y-4"
            animate={{ 
              height: isExpanded ? 'calc(85vh - 100px)' : '400px' 
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {messages.length === 0 && videoMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                className="text-center text-muted-foreground py-12"
              >
                {/* Bot Avatar with slide-up animation */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                >
                  <Atom className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                </motion.div>
                
                {/* Typing animation text */}
                <motion.p 
                  className="text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  {promptText}
                  <motion.span 
                    className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    transition={{ duration: 0.1 }}
                  />
                </motion.p>
                
                <motion.p 
                  className="text-sm mt-2 opacity-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: typingComplete ? 0.6 : 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  Or switch to Electrical Mode for circuit simulation
                </motion.p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25,
                    delay: index * 0.02 
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    layout
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/50 prose-pre:p-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator for text */}
            <AnimatePresence>
              {isTyping && <MessageLoader />}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {showError && <ErrorMessage onRetry={handleRetry} />}
            </AnimatePresence>

            {/* Animation loading indicator */}
            <AnimatePresence>
              {isGeneratingAnimation && <AnimationLoader />}
            </AnimatePresence>

            {/* Video messages */}
            <AnimatePresence>
              {videoMessages.map((video) => (
                <ManimVideoPlayer key={video.id} videoUrl={video.videoUrl} />
              ))}
            </AnimatePresence>

            {/* Video error message */}
            <AnimatePresence>
              {showVideoError && <VideoErrorMessage onRetry={handleRetryVideo} />}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3">
              {/* LaTeX Toggle */}
              <Button
                variant={isLatexMode ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setIsLatexMode(!isLatexMode)}
                className="shrink-0 h-10 w-10 rounded-full"
                disabled={isProcessing}
              >
                <span className="text-xs font-mono">LaTeX</span>
              </Button>

              {/* Voice Input */}
              <Button 
                variant={isListening ? 'default' : 'ghost'} 
                size="icon" 
                className={`shrink-0 h-10 w-10 rounded-full transition-all ${
                  isListening ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : ''
                }`}
                disabled={isProcessing}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              {/* Input Field */}
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={isListening ? 'Listening...' : (isLatexMode ? 'Enter LaTeX expression...' : 'Ask a question...')}
                  className={`h-12 rounded-full bg-secondary/50 border-border/50 focus:border-primary/50 transition-opacity ${
                    isProcessing ? 'opacity-50' : ''
                  }`}
                  disabled={isProcessing}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                size="icon"
                className="shrink-0 h-12 w-12 rounded-full neon-glow-subtle"
                disabled={!inputValue.trim() || isProcessing}
              >
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <SendButtonLoader key="loader" />
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Background decorations - expand with chat */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            width: isExpanded ? '600px' : '384px',
            height: isExpanded ? '600px' : '384px',
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            width: { type: 'spring', stiffness: 100, damping: 20 },
            height: { type: 'spring', stiffness: 100, damping: 20 },
            x: { duration: 10, repeat: Infinity },
            y: { duration: 10, repeat: Infinity },
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            width: isExpanded ? '600px' : '384px',
            height: isExpanded ? '600px' : '384px',
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            width: { type: 'spring', stiffness: 100, damping: 20 },
            height: { type: 'spring', stiffness: 100, damping: 20 },
            x: { duration: 8, repeat: Infinity },
            y: { duration: 8, repeat: Infinity },
          }}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
