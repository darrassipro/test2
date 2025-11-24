import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown } from 'lucide-react-native';
import { useCompleteRegistrationMutation } from '@/services/userApi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser, updateUser } from '@/services/slices/userSlice';
import Toast from 'react-native-toast-message';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 
  'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 
  'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 
  'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
  'Yemen', 'Zambia', 'Zimbabwe'
];

export default function CompleteProfile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  const [completeRegistration, { isLoading }] = useCompleteRegistrationMutation();
  
  // Parse socialMediaLinks if it's a string
  const getSocialLinks = () => {
    let socialLinks = user?.socialMediaLinks || {};
    if (typeof socialLinks === 'string') {
      try {
        socialLinks = JSON.parse(socialLinks);
      } catch (e) {
        socialLinks = {};
      }
    }
    return socialLinks;
  };

  const initialSocialLinks = getSocialLinks();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profileDescription: user?.profileDescription || '',
    country: user?.country || '',
    facebook: initialSocialLinks?.facebook || '',
    instagram: initialSocialLinks?.instagram || '',
    whatsapp: initialSocialLinks?.whatsapp || '',
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [bannerImage, setBannerImage] = useState<string | null>(user?.banner || null);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      console.log('=== USER DATA DEBUG ===');
      console.log('socialMediaLinks raw:', user.socialMediaLinks);
      console.log('socialMediaLinks type:', typeof user.socialMediaLinks);
      
      // Handle socialMediaLinks - it might be object, string, or undefined
      let socialLinks = {};
      
      if (user.socialMediaLinks) {
        if (typeof user.socialMediaLinks === 'string') {
          try {
            socialLinks = JSON.parse(user.socialMediaLinks);
            console.log('Parsed from string:', socialLinks);
          } catch (e) {
            console.error('Failed to parse socialMediaLinks:', e);
            socialLinks = {};
          }
        } else if (typeof user.socialMediaLinks === 'object') {
          socialLinks = user.socialMediaLinks;
          console.log('Already an object:', socialLinks);
        }
      }

      console.log('Final socialLinks:', socialLinks);
      console.log('Facebook:', socialLinks?.facebook);
      console.log('Instagram:', socialLinks?.instagram);
      console.log('WhatsApp:', socialLinks?.whatsapp);

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileDescription: user.profileDescription || '',
        country: user.country || '',
        facebook: socialLinks?.facebook || '',
        instagram: socialLinks?.instagram || '',
        whatsapp: socialLinks?.whatsapp || '',
      });
      setProfileImage(user.profileImage || null);
      setBannerImage(user.banner || null);
      
      console.log('Form data set with facebook:', socialLinks?.facebook);
      console.log('=== END DEBUG ===');
    }
  }, [user]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleImagePick = async (type: 'profile' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'profile') {
        setProfileImage(result.assets[0].uri);
      } else {
        setBannerImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const registrationData: any = {};

      // Only send fields that have values
      if (formData.firstName.trim()) registrationData.firstName = formData.firstName.trim();
      if (formData.lastName.trim()) registrationData.lastName = formData.lastName.trim();
      if (formData.profileDescription.trim()) registrationData.profileDescription = formData.profileDescription.trim();
      if (formData.country.trim()) registrationData.country = formData.country.trim();
      if (profileImage) registrationData.profileImage = profileImage;
      if (bannerImage) registrationData.banner = bannerImage;

      // Only send social links if at least one is filled
      const socialLinks: any = {};
      if (formData.facebook.trim()) socialLinks.facebook = formData.facebook.trim();
      if (formData.instagram.trim()) socialLinks.instagram = formData.instagram.trim();
      if (formData.whatsapp.trim()) socialLinks.whatsapp = formData.whatsapp.trim();
      
      if (Object.keys(socialLinks).length > 0) {
        registrationData.socialMediaLinks = JSON.stringify(socialLinks);
      }

      const result = await completeRegistration(registrationData).unwrap();
      
      if (result.success) {
        dispatch(updateUser(result.data));
        
        Toast.show({
          type: 'success',
          text1: 'Profil mis à jour',
          text2: result.message || 'Vos informations ont été sauvegardées',
        });
        
        // Navigate to success page with completion status
        router.replace('/profile-success');
      }
    } catch (error: any) {
      console.error('Error completing profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.data?.error || 'Impossible de sauvegarder le profil',
      });
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete your Profil</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner and Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.bannerContainer}
            onPress={() => handleImagePick('banner')}
          >
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
            ) : (
              <View style={styles.bannerPlaceholder} />
            )}
            <TouchableOpacity style={styles.editBannerButton}>
              <Camera size={17} color="#000000" />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => handleImagePick('profile')}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
            <View style={styles.editProfileButton}>
              <Camera size={17} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#7E7E7E"
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChangeText={(text) => {
                const names = text.split(' ');
                setFormData({
                  ...formData,
                  firstName: names[0] || '',
                  lastName: names.slice(1).join(' ') || '',
                });
              }}
            />
          </View>

          {/* About */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>About</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adventure lover exploring the world…"
              placeholderTextColor="#7E7E7E"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.profileDescription}
              onChangeText={(text) => setFormData({ ...formData, profileDescription: text })}
            />
          </View>

          {/* Country */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setShowCountryModal(true)}
            >
              <View style={styles.input}>
                <Text style={[styles.inputText, !formData.country && styles.placeholderText]}>
                  {formData.country || 'Select your country'}
                </Text>
              </View>
              <ChevronDown size={18} color="#000000" style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Social links (At least one required)</Text>
            
            <View style={styles.socialLinksContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Facebook</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.facebook.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={formData.facebook}
                  onChangeText={(text) => setFormData({ ...formData, facebook: text })}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Instagram</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.instagram.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={formData.instagram}
                  onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>WhatsApp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://wa.me/1234567890"
                  placeholderTextColor="#A1A0A0"
                  value={formData.whatsapp}
                  onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCountryModal(false);
          setCountrySearch('');
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowCountryModal(false);
            setCountrySearch('');
          }}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search country..."
                placeholderTextColor="#7E7E7E"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    formData.country === item && styles.countryItemSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, country: item });
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={[
                    styles.countryItemText,
                    formData.country === item && styles.countryItemTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={styles.countryList}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageSection: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  bannerContainer: {
    width: 345,
    height: 164,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D9D9D9',
  },
  editBannerButton: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D9D9D9',
    marginTop: -42,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D9D9D9',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 15,
    gap: 24,
  },
  fieldContainer: {
    gap: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  required: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E72858',
  },
  input: {
    height: 49,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  textArea: {
    height: 193,
    paddingTop: 22,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  placeholderText: {
    color: '#7E7E7E',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 14,
    top: 15.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    height: 42,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F1F1F',
  },
  countryList: {
    maxHeight: 320,
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  countryItemSelected: {
    backgroundColor: '#FFE8EE',
  },
  countryItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  countryItemTextSelected: {
    color: '#E72858',
    fontWeight: '600',
  },
  socialSection: {
    gap: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  socialLinksContainer: {
    gap: 16,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 17,
    paddingHorizontal: 20,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E72858',
    borderRadius: 1200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.007,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#1F1F1F',
    letterSpacing: 0.007,
  },
});
