import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import UserCategoryScreen, { UserCategory } from './UserCategoryScreen';
import SubjectPreferenceScreen, { SubjectPreference } from './SubjectPreferenceScreen';

type OnboardingStep = 'welcome' | 'category' | 'subject';

interface OnboardingFlowProps {
  onComplete: (data: { category: UserCategory; preference: SubjectPreference }) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [category, setCategory] = useState<UserCategory | null>(null);

  const handleWelcomeNext = () => {
    setStep('category');
  };

  const handleCategoryNext = (selectedCategory: UserCategory) => {
    setCategory(selectedCategory);
    setStep('subject');
  };

  const handleCategoryBack = () => {
    setStep('welcome');
  };

  const handleSubjectComplete = (preference: SubjectPreference) => {
    if (category) {
      onComplete({ category, preference });
    }
  };

  const handleSubjectBack = () => {
    setStep('category');
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'welcome' && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen onNext={handleWelcomeNext} />
        </motion.div>
      )}

      {step === 'category' && (
        <motion.div
          key="category"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserCategoryScreen onNext={handleCategoryNext} onBack={handleCategoryBack} />
        </motion.div>
      )}

      {step === 'subject' && (
        <motion.div
          key="subject"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SubjectPreferenceScreen onComplete={handleSubjectComplete} onBack={handleSubjectBack} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingFlow;
