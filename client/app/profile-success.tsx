import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Info } from 'lucide-react-native';
import { useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/services/slices/userSlice';

export default function ProfileSuccess() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      // Calculate completion percentage based on required fields (same as backend)
      const requiredFields = [
        user.firstName,
        user.lastName,
        user.profileImage,
        user.banner,
        user.profileDescription,
        user.country,
      ];

      const filledFields = requiredFields.filter(field => {
        if (typeof field === 'string') {
          return field.trim().length > 0;
        }
        return Boolean(field);
      }).length;

      // Check if at least one social link is filled
      const hasSocialLinks = user.socialMediaLinks && 
        typeof user.socialMediaLinks === 'object' &&
        Object.values(user.socialMediaLinks).some(
          (value) => typeof value === 'string' && value.trim().length > 0
        );

      // Total: 6 required fields + 1 for social links = 7
      const totalRequired = 7;
      const totalFilled = filledFields + (hasSocialLinks ? 1 : 0);
      const percentage = Math.round((totalFilled / totalRequired) * 100);
      setCompletionPercentage(percentage);
    }
  }, [user]);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleCreateCommunity = () => {
    // TODO: Navigate to create community screen when implemented
    router.replace('/(tabs)');
  };

  const isComplete = user?.isProfileCompleted;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Success Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isComplete ? (
            <CheckCircle size={32} color="#E72858" fill="#E72858" />
          ) : (
            <Info size={32} color="#FFA500" fill="#FFA500" />
          )}
        </View>

        <View style={styles.textContainer}>
          {isComplete ? (
            <>
              <Text style={styles.title}>🎉 Your Profil is completed</Text>
              <Text style={styles.description}>
                Welcome to your new travel hub a place where you can share your adventures, inspire others, and grow your supporters.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Profile Updated</Text>
              <Text style={styles.description}>
                Your profile is {completionPercentage}% complete. Fill in the remaining details to unlock all features and enhance your experience.
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
              </View>
              <Text style={styles.percentageText}>{completionPercentage}%</Text>
            </>
          )}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleGoHome}
        >
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.communityButton}
          onPress={handleCreateCommunity}
        >
          <Text style={styles.communityButtonText}>Create Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 35,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
    width: 305,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
    color: '#1F1F1F',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
    color: '#5B5B5B',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E72858',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E72858',
    marginTop: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 3,
  },
  homeButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 1200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  communityButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#E72858',
    borderRadius: 1200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
