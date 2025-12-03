import { Stack, useRouter, useSegments } from "expo-router";
import "./globals.css";
import { StatusBar, Text, View, ActivityIndicator } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Provider, useSelector } from "react-redux";
import { store } from "@/lib/store";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/lib/toastConfig";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { checkAuth, selectIsAuthenticated, selectIsLoading, selectUser } from "@/services/slices/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import '@/i18n';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Composant interne pour gérer la navigation basée sur l'authentification
function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);
  const router = useRouter();
  const segments = useSegments();

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  // Rediriger selon l'état d'authentification
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const isOnboarding = segments[0] === "onboarding";
    const isAuthPage = segments[0] === "login" || segments[0] === "signup" || segments[0] === "otp" || segments[0] === "success";

    if (!isAuthenticated) {
      if (inAuthGroup) {
        router.replace("/onboarding");
      }
    } else {
      // Si le profil est complet et qu'on est sur une page auth, aller vers tabs
      if (user?.isProfileCompleted && isAuthPage && !isOnboarding) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments, router, user]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Stack>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="post/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="story/[userId]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-post/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="otp"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="success"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="saved/[group]"
          options={{
            headerShown: false,
          }}
        />
<Stack.Screen
  name="(tabs)/community/[id]"
  options={({ route }: any) => ({
    headerTitle: route?.params?.communityName ?? 'Communauté',
    headerTitleAlign: 'center',
  })}
/>
        <Stack.Screen
          name="complete-profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile-success"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  // Appliquer Inter comme police par défaut
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.style = [
    (Text as any).defaultProps.style,
    { fontFamily: "Inter_400Regular" },
  ];

  // Configurer la barre de navigation Android (icônes sombres, fond clair) sur toutes les pages
  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#FFFFFF");
        await NavigationBar.setButtonStyleAsync("dark");
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
       <LanguageProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} />
      </LanguageProvider>
    </Provider>
  );
}
