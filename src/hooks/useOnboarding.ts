import { useState, useEffect } from 'react';
import { UserCategory } from '@/components/onboarding/UserCategoryScreen';
import { SubjectPreference } from '@/components/onboarding/SubjectPreferenceScreen';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  USER_CATEGORY: 'selectedUserCategory',
  QUESTION_TYPE: 'selectedQuestionType',
} as const;

interface OnboardingData {
  category: UserCategory;
  preference: SubjectPreference;
}

interface UseOnboardingReturn {
  isOnboardingComplete: boolean;
  userCategory: UserCategory | null;
  questionType: SubjectPreference | null;
  completeOnboarding: (data: OnboardingData) => void;
  resetOnboarding: () => void;
  isLoading: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userCategory, setUserCategory] = useState<UserCategory | null>(null);
  const [questionType, setQuestionType] = useState<SubjectPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      const category = localStorage.getItem(STORAGE_KEYS.USER_CATEGORY) as UserCategory | null;
      const preference = localStorage.getItem(STORAGE_KEYS.QUESTION_TYPE) as SubjectPreference | null;

      if (completed === 'true' && category && preference) {
        setIsOnboardingComplete(true);
        setUserCategory(category);
        setQuestionType(preference);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = (data: OnboardingData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER_CATEGORY, data.category);
      localStorage.setItem(STORAGE_KEYS.QUESTION_TYPE, data.preference);

      setIsOnboardingComplete(true);
      setUserCategory(data.category);
      setQuestionType(data.preference);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      localStorage.removeItem(STORAGE_KEYS.USER_CATEGORY);
      localStorage.removeItem(STORAGE_KEYS.QUESTION_TYPE);

      setIsOnboardingComplete(false);
      setUserCategory(null);
      setQuestionType(null);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return {
    isOnboardingComplete,
    userCategory,
    questionType,
    completeOnboarding,
    resetOnboarding,
    isLoading,
  };
}
