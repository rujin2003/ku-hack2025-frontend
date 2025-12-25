import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from '@/components/chat/ChatInterface';
import ElectricalSimulator from '@/components/electrical/ElectricalSimulator';
import GraphingCalculator from '@/components/graphing/GraphingCalculator';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useAppStore, AppMode } from '@/stores/appStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import { UserCategory } from '@/components/onboarding/UserCategoryScreen';
import { SubjectPreference } from '@/components/onboarding/SubjectPreferenceScreen';

const Index = () => {
  const { mode, isTransitioning, setMode, setTransitioning, setInitialMode } = useAppStore();
  const { isOnboardingComplete, completeOnboarding, isLoading } = useOnboarding();
  const transitionNodeRef = useRef<HTMLDivElement>(null);

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === mode) return;
    
    // Transitions for special modes (electrical, graphs)
    const specialModes: AppMode[] = ['electrical', 'graphs'];
    const needsTransition = specialModes.includes(newMode) || specialModes.includes(mode);
    
    if (needsTransition) {
      setTransitioning(true);
      
      setTimeout(() => {
        setMode(newMode);
        setTimeout(() => setTransitioning(false), 500);
      }, 500);
    } else {
      setMode(newMode);
    }
  };

  const handleOnboardingComplete = (data: { category: UserCategory; preference: SubjectPreference }) => {
    completeOnboarding(data);
    
    // Map preference to app mode for the mode selector highlight
    const modeMap: Record<SubjectPreference, AppMode> = {
      math: 'math',
      physics: 'physics',
      electrical: 'electrical',
    };
    
    const targetMode = modeMap[data.preference];
    setInitialMode(targetMode);
    setMode(targetMode);
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Show onboarding if not completed
  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (mode) {
      case 'electrical':
        return (
          <motion.div
            key="electrical"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ElectricalSimulator onBack={() => handleModeChange('chat')} />
          </motion.div>
        );
      case 'graphs':
        return (
          <motion.div
            key="graphs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GraphingCalculator onBack={() => handleModeChange('chat')} />
          </motion.div>
        );
      case 'math':
      case 'physics':
      default:
        return (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatInterface onModeChange={handleModeChange} />
          </motion.div>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            ref={transitionNodeRef}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-primary"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 50, 100] }}
              exit={{ scale: [100, 50, 1], opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 0 60px hsl(var(--primary)), 0 0 120px hsl(var(--primary) / 0.5)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

export default Index;
