import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useVerifyOTPMutation, useResendOTPMutation } from "@/services/authApi";
import { saveToken } from "@/lib/tokenStorage";
import { handleAuthError, showSuccessToast } from "@/lib/errorHandler";
import { useAppDispatch } from "@/lib/hooks";
import { setUserData } from "@/services/slices/userSlice";

export default function OTP() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(index + digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  const handleResend = async () => {
    if (!email) {
      handleAuthError({ data: { error: "Email manquant" } });
      return;
    }

    try {
      const result = await resendOTP({ email }).unwrap();
      
      if (result.success) {
        setTimeLeft(600); // Réinitialiser à 10 minutes
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        showSuccessToast("Code OTP renvoyé", "Vérifiez votre email pour le nouveau code");
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors du renvoi du code");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = async () => {
    if (!otp.every((digit) => digit !== "")) {
      return;
    }

    if (!email) {
      handleAuthError({ data: { error: "Email manquant" } });
      return;
    }

    const otpCode = otp.join("");

    try {
      const result = await verifyOTP({
        email: email,
        otp: otpCode,
      }).unwrap();

      // RTK Query retourne directement le body de la réponse HTTP
      // Le serveur retourne : { success: true, data: { token: "...", user: {...} } }
      if (result?.success && result?.data?.token) {
        // Sauvegarder le token dans SecureStore
        const saved = await saveToken(result.data.token);
        
        if (saved) {
          // Mettre à jour le slice Redux avec les données de l'utilisateur
          await dispatch(setUserData({
            user: result.data.user,
            token: result.data.token,
          } as any) as any);
          showSuccessToast("Email vérifié", "Votre compte a été vérifié avec succès !");
          // Rediriger vers la page de succès avec le nom de l'utilisateur
          const userName = result.data.user?.firstName || result.data.user?.username || "Utilisateur";
          router.replace(`/success?name=${encodeURIComponent(userName)}`);
        } else {
          handleAuthError({ data: { error: "Impossible de sauvegarder le token. Veuillez réessayer." } });
        }
      } else {
        handleAuthError({ data: { error: "Réponse invalide du serveur" } });
      }
    } catch (error: any) {
      // Gérer les erreurs avec des toasts stylés
      handleAuthError(error, "Code OTP invalide");
      // Réinitialiser l'OTP en cas d'erreur
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-black">Verification de gmail</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-6 pt-8">
          {/* Title */}
          <Text className="text-3xl font-bold text-black mb-2">6-digit code</Text>
          <Text className="text-sm text-gray-600 mb-8">
            Code sent to {email || "exemple@gmail.com"} unless you already have an account.
          </Text>

          {/* OTP Input Fields */}
          <View className="flex-row items-center justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <View key={index} className="flex-row items-center">
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  className={`w-14 h-14 border rounded-xl text-center text-2xl font-bold ${
                    digit ? "border-[#E91E63]" : "border-gray-300"
                  }`}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
                {index === 2 && (
                  <Text className="text-2xl font-bold text-gray-400 mx-1">-</Text>
                )}
              </View>
            ))}
          </View>

          {/* Resend Code */}
          <View className="flex-row items-center justify-center mb-8">
            {timeLeft > 0 ? (
              <Text className="text-sm text-gray-600">
                Resend code in {formatTime(timeLeft)}.{" "}
              </Text>
            ) : (
              <>
                {isResending ? (
                  <ActivityIndicator size="small" color="#E91E63" />
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-sm font-semibold text-[#E91E63]">Resend code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`w-full bg-[#E91E63] rounded-3xl py-4 items-center ${
              otp.every((digit) => digit !== "") && !isVerifying ? "opacity-100" : "opacity-50"
            }`}
            onPress={handleNext}
            disabled={!otp.every((digit) => digit !== "") || isVerifying}
            activeOpacity={0.7}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-semibold">Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

