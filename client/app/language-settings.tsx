import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import Toast from 'react-native-toast-message';

export default function LanguageSettings() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage.code) {
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await setLanguage(languageCode);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Language Changed',
        text2: 'Your language preference has been updated'
      });

      setIsDropdownOpen(false);

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('Error saving language:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to change language'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" translucent={false} />
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: '#FDFDFD'
      }}>


        {/* Language Dropdown */}
        <View style={{ paddingTop: 20, paddingHorizontal: 15 }}>
          {/* Selected Language Display */}
          <TouchableOpacity
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 11.7,
              paddingHorizontal: 13,
              borderRadius: 14,
              borderWidth: 0.51,
              borderColor: '#E5E5E5',
              backgroundColor: '#FFFFFF',
              height: 49
            }}
          >
            {/* Flag */}
            <Text style={{
              fontSize: 20,
              marginRight: 10
            }}>
              {currentLanguage.flag}
            </Text>

            {/* Language Text */}
            <Text style={{
              flex: 1,
              fontSize: 12,
              fontWeight: '600',
              color: '#1F1F1F',
              lineHeight: 15
            }}>
              {currentLanguage.name}
            </Text>

            {/* Dropdown Arrow */}
            <ChevronDown 
              size={18} 
              color="#000000" 
              strokeWidth={1.5}
              style={{
                transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }]
              }}
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <View style={{
              marginTop: 5.9,
              borderRadius: 14,
              borderWidth: 0.51,
              borderColor: '#E5E5E5',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden'
            }}>
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  disabled={isLoading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 11.7,
                    paddingHorizontal: 13,
                    height: 49,
                    borderBottomWidth: index < languages.length - 1 ? 0.51 : 0,
                    borderBottomColor: '#E5E5E5',
                    backgroundColor: currentLanguage.code === language.code ? '#F8F9FA' : '#FFFFFF',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {/* Flag */}
                  <Text style={{
                    fontSize: 20,
                    marginRight: 10
                  }}>
                    {language.flag}
                  </Text>

                  {/* Language Text */}
                  <Text style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#1F1F1F',
                    lineHeight: 15
                  }}>
                    {language.name}
                  </Text>

                  {/* Checkmark Icon */}
                  {currentLanguage.code === language.code && (
                    <View style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#000000',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Check size={12} color="#FFFFFF" strokeWidth={1.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}