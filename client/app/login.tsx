import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useLoginMutation } from "@/services/authApi";
import { saveToken, saveRememberMe } from "@/lib/tokenStorage";
import { handleAuthError, showSuccessToast } from "@/lib/errorHandler";
import { useAppDispatch } from "@/lib/hooks";
import { setUserData } from "@/services/slices/userSlice";

// Validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter a valid email address."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .required("Password must be at least 8 characters."),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.replace("/onboarding")}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View className="px-6 mt-8">
          <View className="flex flex-col text-center items-center justify-between">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-4xl font-bold text-black">Welcome Back</Text>
              <Text className="text-4xl">👋</Text>
            </View>
            <Text className="text-center text-gray-600 leading-6 mb-6">
              Connect with explorers around the world and continue your journey.
            </Text>
          </View>

          {/* Toggle Login/Sign Up */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-black"
              onPress={() => {}}
            >
              <Text className="text-center font-medium text-white">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg"
              onPress={() => router.replace("/signup")}
            >
              <Text className="text-center font-medium text-gray-600">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Formik
            initialValues={{
              email: "",
              password: "",
              rememberMe: true,
            }}
            validationSchema={loginSchema}
            onSubmit={async (values) => {
              try {
                const result = await login({
                  email: values.email,
                  password: values.password,
                }).unwrap();

                // RTK Query retourne directement le body de la réponse HTTP
                // Le serveur retourne : { success: true, data: { token: "...", user: {...} } }
                if (result?.success && result?.data?.token) {
                  // Sauvegarder la préférence remember me
                  await saveRememberMe(values.rememberMe);
                  
                  // Sauvegarder le token dans SecureStore
                  const saved = await saveToken(result.data.token);
                  
                  if (saved) {
                    // Mettre à jour le slice Redux avec les données de l'utilisateur
                    await dispatch(setUserData({
                      user: result.data.user,
                      token: result.data.token,
                    } as any) as any);
                    showSuccessToast("Connexion réussie", "Bienvenue !");
                    
                    // Rediriger selon l'état du profil
                    if (!result.data.user.isProfileCompleted) {
                      router.replace("/complete-profile");
                    } else {
                      router.replace("/(tabs)");
                    }
                  } else {
                    handleAuthError({ data: { error: "Impossible de sauvegarder le token. Veuillez réessayer." } });
                  }
                } else {
                  handleAuthError({ data: { error: "Réponse invalide du serveur" } });
                }
              } catch (error: any) {
                // Gérer les erreurs avec des toasts stylés
                handleAuthError(error, "Une erreur est survenue lors de la connexion");
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <>
                {/* Email Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">Email</Text>
                  <TextInput
                    className={`w-full border rounded-xl px-4 py-4 text-base ${
                      errors.email && touched.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && touched.email && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.email}</Text>
                    </View>
                  )}
                </View>

                {/* Password Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">Password</Text>
                  <View className="relative">
                    <TextInput
                      className={`w-full border rounded-xl px-4 py-4 text-base pr-12 ${
                        errors.password && touched.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                    </TouchableOpacity>
                  </View>
                  {errors.password && touched.password && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.password}</Text>
                    </View>
                  )}
                </View>

                {/* Remember me & Forgot password */}
                <View className="flex-row items-center justify-between mb-6">
                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={() => setFieldValue("rememberMe", !values.rememberMe)}
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded items-center justify-center ${
                        values.rememberMe ? "bg-[#E91E63] border-[#E91E63]" : "border-[#E91E63]"
                      }`}
                    >
                      {values.rememberMe && <Text className="text-white text-xs">✓</Text>}
                    </View>
                    <Text className="text-sm text-black">Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-sm text-black">Forgot your password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  className={`w-full bg-[#E91E63] rounded-3xl py-4 items-center mb-6 ${
                    isLoading ? "opacity-50" : ""
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-semibold">Login</Text>
                  )}
                </TouchableOpacity>

                {/* Separator */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="px-4 text-sm text-gray-600">Ou</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Social Login Buttons */}
                <View className="flex-row items-center justify-center gap-4 mb-8">
                  {/* Google */}
                  <TouchableOpacity className="w-14 h-14 rounded-full bg-white border border-gray-200 items-center justify-center">
                    <Text className="text-2xl font-bold" style={{ color: "#4285F4" }}>
                      G
                    </Text>
                  </TouchableOpacity>

                  {/* Facebook */}
                  <TouchableOpacity className="w-14 h-14 rounded-full bg-white border border-gray-200 items-center justify-center">
                    <View className="w-8 h-8 bg-blue-600 rounded items-center justify-center">
                      <Text className="text-white font-bold text-sm">f</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Apple */}
                  <TouchableOpacity className="w-14 h-14 rounded-full bg-white border border-gray-200 items-center justify-center">
                    <Text className="text-2xl">🍎</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

