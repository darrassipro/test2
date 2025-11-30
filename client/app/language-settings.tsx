import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage, languages } from '@/contexts/LanguageContext';

export default function LanguageSettings() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage.code) return;
    
    setIsLoading(true);
    try {
      await setLanguage(languageCode);
      
      // Show success message
      Alert.alert(
        t('language.changed'),
        t('language.changed_message'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert(t('common.error'), t('language.error_message'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: '#FDFDFD'
      }}>
        {/* Header */}
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          marginTop: 15
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <ChevronLeft 
              size={24} 
              color="#000000" 
              strokeWidth={2}
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </TouchableOpacity>

          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#000000',
            textAlign: 'center',
            flex: 1
          }}>
            {t('language.title')}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Language Options */}
        <View style={{ flex: 1, paddingTop: 20 }}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              disabled={isLoading}
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: 16,
                marginHorizontal: 15,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: currentLanguage.code === language.code ? 2 : 1,
                borderColor: currentLanguage.code === language.code ? '#E72858' : '#E5E5E5',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <View style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row', 
                alignItems: 'center', 
                flex: 1 
              }}>
                <Text style={{
                  fontSize: 24,
                  marginRight: isRTL ? 0 : 16,
                  marginLeft: isRTL ? 16 : 0
                }}>
                  {language.flag}
                </Text>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1F1F1F',
                    marginBottom: 2,
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t(`language.${language.code === 'en' ? 'english' : language.code === 'fr' ? 'french' : 'arabic'}`)}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                    fontWeight: '400',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {language.nativeName}
                  </Text>
                </View>
              </View>

              {currentLanguage.code === language.code && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#E72858',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Check size={16} color="#FFFFFF" strokeWidth={2} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Text */}
        <View style={{
          backgroundColor: '#F8F9FA',
          margin: 15,
          padding: 16,
          marginBottom: 20,
          borderRadius: 12
        }}>
          <Text style={{
            fontSize: 14,
            color: '#666',
            textAlign: isRTL ? 'right' : 'center',
            lineHeight: 20
          }}>
            {t('language.info')}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}