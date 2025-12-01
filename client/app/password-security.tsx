import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdatePasswordMutation } from "@/services/userApi";

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function PasswordSecurity() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const handleNewPasswordChange = (password: string) => {
    setNewPassword(password);
    setValidation(validatePassword(password));
  };

  const isPasswordValid = () => {
    const val = validation;
    return val.minLength && val.hasUppercase && val.hasLowercase && val.hasNumber && val.hasSpecialChar;
  };

  const handleSave = async () => {
    // Validation
    if (!oldPassword.trim()) {
      Alert.alert(t('common.error'), t('password.validation.required'));
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert(t('common.error'), t('password.validation.required'));
      return;
    }

    if (!isPasswordValid()) {
      Alert.alert(t('common.error'), 'Please ensure your password meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('password.validation.passwords_match'));
      return;
    }

    try {
      const result = await updatePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      }).unwrap();

      Alert.alert(
        t('password.change_success'),
        t('password.change_success_message'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.data?.error || t('password.change_error');
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <View style={{
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 4
    }}>
      {isValid ? (
        <Check size={16} color="#22C55E" strokeWidth={2} />
      ) : (
        <X size={16} color="#EF4444" strokeWidth={2} />
      )}
      <Text style={{
        fontSize: 12,
        color: isValid ? '#22C55E' : '#EF4444',
        marginLeft: isRTL ? 0 : 8,
        marginRight: isRTL ? 8 : 0,
        textAlign: isRTL ? 'right' : 'left'
      }}>
        {text}
      </Text>
    </View>
  );

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
            {t('password.title')}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1, paddingTop: 20 }}>
          {/* Form Fields */}
          <View style={{
            paddingHorizontal: 15,
            gap: 24
          }}>
            {/* Old Password */}
            <View>
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#7E7E7E',
                marginBottom: 6,
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {t('password.old_password')}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 14,
                  padding: 12,
                  fontSize: 12,
                  color: '#1F1F1F',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                placeholder={t('password.old_password_placeholder')}
                placeholderTextColor="#A1A0A0"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />
            </View>

            {/* New Password */}
            <View>
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#7E7E7E',
                marginBottom: 6,
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {t('password.new_password')}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 14,
                  padding: 12,
                  fontSize: 12,
                  color: '#1F1F1F',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                placeholder={t('password.new_password_placeholder')}
                placeholderTextColor="#A1A0A0"
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                secureTextEntry
              />
              
              {/* Password Validation */}
              {newPassword.length > 0 && (
                <View style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 8
                }}>
                  <ValidationItem 
                    isValid={validation.minLength} 
                    text={t('password.validation.min_length')} 
                  />
                  <ValidationItem 
                    isValid={validation.hasUppercase} 
                    text={t('password.validation.uppercase')} 
                  />
                  <ValidationItem 
                    isValid={validation.hasLowercase} 
                    text={t('password.validation.lowercase')} 
                  />
                  <ValidationItem 
                    isValid={validation.hasNumber} 
                    text={t('password.validation.number')} 
                  />
                  <ValidationItem 
                    isValid={validation.hasSpecialChar} 
                    text={t('password.validation.special_char')} 
                  />
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#7E7E7E',
                marginBottom: 6,
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {t('password.confirm_password')}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 14,
                  padding: 12,
                  fontSize: 12,
                  color: '#1F1F1F',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                placeholder={t('password.confirm_password_placeholder')}
                placeholderTextColor="#A1A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              {/* Password Match Validation */}
              {confirmPassword.length > 0 && newPassword.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <ValidationItem 
                    isValid={newPassword === confirmPassword} 
                    text={newPassword === confirmPassword ? 'Passwords match' : t('password.validation.passwords_match')} 
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingBottom: 24,
          gap: 12
        }}>
          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 3
            }}
          >
            <View style={{
              width: 14,
              height: 14,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <X size={12} color="#5B5B5B" strokeWidth={1.5} />
            </View>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#5B5B5B',
              textAlign: 'center'
            }}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || !oldPassword || !newPassword || !confirmPassword || !isPasswordValid() || newPassword !== confirmPassword}
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 6,
              paddingHorizontal: 18,
              backgroundColor: '#E72858',
              borderRadius: 740,
              gap: 5,
              opacity: (isLoading || !oldPassword || !newPassword || !confirmPassword || !isPasswordValid() || newPassword !== confirmPassword) ? 0.6 : 1
            }}
          >
            <View style={{
              width: 15,
              height: 15,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Check size={12} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#FFFFFF',
              textAlign: 'center'
            }}>
              {isLoading ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}