import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Eye, EyeOff, HelpCircle } from "lucide-react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRegisterMutation } from "@/services/authApi";
import { saveToken } from "@/lib/tokenStorage";
import { handleAuthError, showSuccessToast } from "@/lib/errorHandler";
import { signupSchema } from "@/constants/constant";
import { useAppDispatch } from '@/lib/hooks';
import { communityApi } from '@/services/communityApi';


export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View className="px-6 mt-8">
          <Text className="text-4xl font-bold text-black mb-2">Join the Travelers Community</Text>
          <Text className="text-base text-gray-600 leading-6 mb-6">
            Share your adventures, connect with travelers, and even earn from your passion.
          </Text>

          {/* Toggle Login/Sign Up */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg"
              onPress={() => router.replace("/login")}
            >
              <Text className="text-center font-medium text-gray-600">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-black"
              onPress={() => {}}
            >
              <Text className="text-center font-medium text-white">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              mobileNumber: "",
              password: "",
              confirmPassword: "",
              agreeToTerms: false,
            }}
            validationSchema={signupSchema}
            onSubmit={async (values) => {
              try {
                const result = await register({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  mobileNumber: values.mobileNumber,
                  password: values.password,
                  confirmPassword: values.confirmPassword,
                  agreeToTerms: values.agreeToTerms,
                }).unwrap();

                if (result.success) {
                  // Sauvegarder le token si disponible (même si le compte n'est pas encore vérifié)
                  if (result.data?.token) {
                    await saveToken(result.data.token);
                    try {
                      // Invalidate community queries so membership-aware lists refetch with the new token
                      dispatch(communityApi.util.invalidateTags(['Community']));
                    } catch (e) {
                      console.warn('Failed to invalidate community cache after signup', e);
                    }
                  }
                  
                  showSuccessToast("Inscription réussie", "Vérifiez votre email pour le code OTP");
                  // Rediriger vers la page OTP
                  router.push(`/otp?email=${encodeURIComponent(values.email)}`);
                }
              } catch (error: any) {
                // Gérer les erreurs avec des toasts stylés
                handleAuthError(error, "Une erreur est survenue lors de l'inscription");
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <>
                {/* First Name Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">First Name</Text>
                  <TextInput
                    className={`w-full border rounded-xl px-4 py-4 text-base ${
                      errors.firstName && touched.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                    placeholderTextColor="#999"
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    autoCapitalize="words"
                  />
                  {errors.firstName && touched.firstName && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.firstName}</Text>
                    </View>
                  )}
                </View>

                {/* Last Name Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">Last Name</Text>
                  <TextInput
                    className={`w-full border rounded-xl px-4 py-4 text-base ${
                      errors.lastName && touched.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your Last name"
                    placeholderTextColor="#999"
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    autoCapitalize="words"
                  />
                  {errors.lastName && touched.lastName && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.lastName}</Text>
                    </View>
                  )}
                </View>

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

                {/* Mobile Number Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">Mobile Number</Text>
                  <View
                    className={`flex-row items-center border rounded-xl px-4 py-4 ${
                      errors.mobileNumber && touched.mobileNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <View className="w-8 h-5 mr-3 items-center justify-center">
                      <Text className="text-lg">🇲🇦</Text>
                    </View>
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Enter your Phone number"
                      placeholderTextColor="#999"
                      value={values.mobileNumber}
                      onChangeText={handleChange("mobileNumber")}
                      onBlur={handleBlur("mobileNumber")}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {errors.mobileNumber && touched.mobileNumber && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.mobileNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Password Field */}
                <View className="mb-2">
                  <Text className="text-sm font-medium text-black mb-2">Password</Text>
                  <View className="relative">
                    <TextInput
                      className={`w-full border rounded-xl px-4 py-4 text-base pr-12 ${
                        errors.password && touched.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Create a password"
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

                {/* Password Requirement */}
                {!errors.password && (
                  <View className="flex-row items-center gap-1 mb-4">
                    <HelpCircle size={14} color="#999" />
                    <Text className="text-xs text-gray-500">Use at least 8 characters.</Text>
                  </View>
                )}

                {/* Confirm Password Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-black mb-2">Confirm Password</Text>
                  <View className="relative">
                    <TextInput
                      className={`w-full border rounded-xl px-4 py-4 text-base pr-12 ${
                        errors.confirmPassword && touched.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.confirmPassword}</Text>
                    </View>
                  )}
                </View>

                {/* Terms & Conditions */}
                <View className="mb-6">
                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={() => setFieldValue("agreeToTerms", !values.agreeToTerms)}
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded items-center justify-center ${
                        values.agreeToTerms ? "bg-[#E91E63] border-[#E91E63]" : "border-[#E91E63]"
                      }`}
                    >
                      {values.agreeToTerms && <Text className="text-white text-xs">✓</Text>}
                    </View>
                    <Text className="text-sm text-black">
                      I agree to the{" "}
                      <Text className="text-[#E91E63] underline">Terms</Text>
                      {" & "}
                      <Text className="text-[#E91E63] underline">Conditions</Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agreeToTerms && touched.agreeToTerms && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-red-500">?</Text>
                      <Text className="text-xs text-red-500">{errors.agreeToTerms}</Text>
                    </View>
                  )}
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  className={`w-full bg-[#E91E63] rounded-3xl py-4 items-center mb-6 ${
                    isLoading ? "opacity-50" : ""
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-semibold">Sign Up</Text>
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

