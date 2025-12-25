import { create } from 'zustand';

export type AppMode = 'chat' | 'math' | 'physics' | 'electrical' | 'graphs';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AppStore {
  mode: AppMode;
  isTransitioning: boolean;
  messages: Message[];
  isTyping: boolean;
  showWelcome: boolean;
  initialMode: AppMode | null;
  
  setMode: (mode: AppMode) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setIsTyping: (isTyping: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  setInitialMode: (mode: AppMode | null) => void;
}

const getInitialMode = (): AppMode => {
  try {
    const savedPreference = localStorage.getItem('selectedQuestionType');
    if (savedPreference === 'math' || savedPreference === 'physics') {
      return savedPreference;
    }
  } catch (e) {
    // localStorage not available
  }
  return 'math';
};

export const useAppStore = create<AppStore>((set) => ({
  mode: getInitialMode(),
  isTransitioning: false,
  messages: [],
  isTyping: false,
  showWelcome: true,
  initialMode: null,

  setMode: (mode) => set({ mode }),
  
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  
  setIsTyping: (isTyping) => set({ isTyping }),
  
  setShowWelcome: (show) => set({ showWelcome: show }),
  
  setInitialMode: (mode) => set({ initialMode: mode }),
}));
