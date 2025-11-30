import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦'
  }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Wait for i18n to be initialized
        await i18n.loadLanguages(['en', 'fr', 'ar']);
        
        const currentLng = i18n.language || 'en';
        const language = languages.find(lang => lang.code === currentLng) || languages[0];
        
        setCurrentLanguage(language);
        setIsRTL(currentLng === 'ar');
      } catch (error) {
        console.error('Error initializing language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      const language = languages.find(lang => lang.code === lng) || languages[0];
      setCurrentLanguage(language);
      setIsRTL(lng === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const setLanguage = async (languageCode: string) => {
    try {
      const language = languages.find(lang => lang.code === languageCode);
      if (language) {
        await i18n.changeLanguage(languageCode);
        setCurrentLanguage(language);
        setIsRTL(languageCode === 'ar');
      }
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isLoading,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};