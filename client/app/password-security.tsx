import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Check, X } from "lucide-react-native";
import { useUpdatePasswordMutation } from "@/services/userApi";

export default function PasswordSecurity() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (!oldPassword.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre ancien mot de passe");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre nouveau mot de passe");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const result = await updatePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      }).unwrap();

      Alert.alert("Succès", "Mot de passe mis à jour avec succès", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Erreur lors de la mise à jour du mot de passe";
      Alert.alert("Erreur", errorMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFD" }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Container */}
      <View
        style={{
          position: "relative",
          width: 380,
          height: 842,
          backgroundColor: "#FDFDFD",
          borderRadius: 30,
          alignSelf: "center",
          flex: 1,
        }}
      >
        {/* Status Bar */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 0,
            gap: 186,
            position: "absolute",
            width: 393,
            height: 22,
            left: -19,
            top: 15,
          }}
        >
          {/* Time */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 6,
              gap: 10,
              width: 103.5,
              height: 22,
            }}
          >
            <Text
              style={{
                width: 36,
                height: 22,
                fontFamily: "Inter",
                fontWeight: "600",
                fontSize: 17,
                lineHeight: 22,
                textAlign: "center",
                color: "#000000",
              }}
            >
              9:41
            </Text>
          </View>

          {/* Battery and signals */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingLeft: 6,
              paddingRight: 16,
              gap: 7,
              width: 103.5,
              height: 13,
            }}
          >
            {/* Cellular Connection */}
            <View
              style={{
                width: 19.2,
                height: 12.23,
                backgroundColor: "#000000",
              }}
            />
            {/* Wifi */}
            <View
              style={{
                width: 17.14,
                height: 12.33,
                backgroundColor: "#000000",
              }}
            />
            {/* Battery */}
            <View
              style={{
                width: 27.33,
                height: 13,
                position: "relative",
              }}
            >
              {/* Border */}
              <View
                style={{
                  position: "absolute",
                  width: 25,
                  height: 13,
                  left: 1.17,
                  top: 0,
                  borderWidth: 1,
                  borderColor: "#000000",
                  borderRadius: 4.3,
                  opacity: 0.35,
                }}
              />
              {/* Cap */}
              <View
                style={{
                  position: "absolute",
                  width: 1.33,
                  height: 4,
                  left: 26,
                  top: 4.5,
                  backgroundColor: "#000000",
                  opacity: 0.4,
                }}
              />
              {/* Capacity */}
              <View
                style={{
                  position: "absolute",
                  width: 21,
                  height: 9,
                  left: 3.17,
                  top: 2,
                  backgroundColor: "#000000",
                  borderRadius: 2.5,
                }}
              />
            </View>
          </View>
        </View>

        {/* Header */}
        <View
          style={{
            position: "absolute",
            width: 180,
            height: 22,
            left: "50%",
            marginLeft: -90,
            top: 59,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter",
              fontWeight: "600",
              fontSize: 18,
              lineHeight: 22,
              textAlign: "center",
              color: "#000000",
            }}
          >
            Password & Security
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            position: "absolute",
            left: 14,
            top: 64,
            width: 12,
            height: 12,
          }}
        >
          <ChevronLeft size={12} color="#000000" strokeWidth={2} />
        </TouchableOpacity>

        {/* Form Container */}
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 0,
            gap: 24,
            position: "absolute",
            width: 345,
            height: 239.71,
            left: "50%",
            marginLeft: -172.5,
            top: 122,
          }}
        >
          {/* Old Password Field */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: 0,
              gap: 5.9,
              width: 345,
              height: 63.9,
            }}
          >
            <Text
              style={{
                width: 345,
                height: 9,
                fontFamily: "Inter",
                fontWeight: "500",
                fontSize: 12,
                lineHeight: 15,
                color: "#7E7E7E",
              }}
            >
              Old Password
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 11.7,
                paddingHorizontal: 8.65,
                gap: 4.07,
                width: 345,
                height: 49,
                borderWidth: 0.51,
                borderColor: "#E5E5E5",
                borderRadius: 14,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 12,
                  lineHeight: 15,
                  color: "#000000",
                }}
                placeholder="Enter your old password"
                placeholderTextColor="#A1A0A0"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
          </View>

          {/* New Password Field */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: 0,
              gap: 5.9,
              width: 345,
              height: 63.9,
            }}
          >
            <Text
              style={{
                width: 345,
                height: 9,
                fontFamily: "Inter",
                fontWeight: "500",
                fontSize: 12,
                lineHeight: 15,
                color: "#7E7E7E",
              }}
            >
              New Password
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 11.7,
                paddingHorizontal: 8.65,
                gap: 4.07,
                width: 345,
                height: 49,
                borderWidth: 0.51,
                borderColor: "#E5E5E5",
                borderRadius: 14,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 12,
                  lineHeight: 15,
                  color: "#000000",
                }}
                placeholder="Enter your new password"
                placeholderTextColor="#A1A0A0"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          {/* Confirm Password Field */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: 0,
              gap: 5.9,
              width: 345,
              height: 63.9,
            }}
          >
            <Text
              style={{
                width: 345,
                height: 9,
                fontFamily: "Inter",
                fontWeight: "500",
                fontSize: 12,
                lineHeight: 15,
                color: "#7E7E7E",
              }}
            >
              Confirm Password
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 11.7,
                paddingHorizontal: 8.65,
                gap: 4.07,
                width: 345,
                height: 49,
                borderWidth: 0.51,
                borderColor: "#E5E5E5",
                borderRadius: 14,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 12,
                  lineHeight: 15,
                  color: "#000000",
                }}
                placeholder="Confirm your new password"
                placeholderTextColor="#A1A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 0,
            gap: 11.81,
            position: "absolute",
            width: 154.26,
            height: 37,
            left: 207.74,
            top: 634,
          }}
        >
          {/* Cancel Button */}
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: 0,
              gap: 2.95,
              width: 57.95,
              height: 14,
            }}
          >
            <View style={{ width: 14, height: 14 }}>
              <X size={14} color="#5B5B5B" strokeWidth={1.17} />
            </View>
            <Text
              style={{
                width: 41,
                height: 14,
                fontFamily: "Inter",
                fontWeight: "600",
                fontSize: 12,
                lineHeight: 14,
                textAlign: "center",
                color: "#5B5B5B",
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 6.17,
              paddingHorizontal: 17.88,
              gap: 4.93,
              width: 84.5,
              height: 37,
              backgroundColor: "#E72858",
              borderRadius: 740,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={{ width: 14.8, height: 14.8 }}>
                  <Check size={14.8} color="#FFFFFF" strokeWidth={1.23} />
                </View>
                <Text
                  style={{
                    width: 29,
                    height: 15,
                    fontFamily: "Inter",
                    fontWeight: "600",
                    fontSize: 12,
                    lineHeight: 15,
                    textAlign: "center",
                    color: "#FFFFFF",
                  }}
                >
                  Save
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View
          style={{
            position: "absolute",
            width: 375,
            height: 92,
            left: "50%",
            marginLeft: -187.5,
            bottom: 0,
          }}
        >
          {/* Background */}
          <View
            style={{
              position: "absolute",
              width: 375,
              height: 92,
              left: 0,
              bottom: 0,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#EEEEEE",
              shadowColor: "#C7C7C7",
              shadowOffset: { width: 8, height: -130 },
              shadowOpacity: 0.01,
              shadowRadius: 52,
              elevation: 10,
            }}
          />

          {/* Navigation Items */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: 0,
              gap: 7,
              position: "absolute",
              width: 339,
              height: 52,
              left: "50%",
              marginLeft: -169.5,
              bottom: 24.4,
            }}
          >
            {/* Feed */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                width: 63,
                height: 46.6,
              }}
            >
              <View style={{ width: 21.6, height: 21.6 }}>
                {/* Feed Icon */}
                <View
                  style={{
                    position: "absolute",
                    left: "12.5%",
                    right: "12.5%",
                    top: "9.44%",
                    bottom: "12.5%",
                    borderWidth: 1.8,
                    borderColor: "#1F1F1F",
                  }}
                />
              </View>
              <Text
                style={{
                  width: 26,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 11,
                  lineHeight: 25,
                  color: "#1F1F1F",
                }}
              >
                Feed
              </Text>
            </View>

            {/* Communities */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                width: 70,
                height: 46.6,
              }}
            >
              <View style={{ width: 21.6, height: 21.6 }}>
                {/* Communities Icon */}
                <View
                  style={{
                    position: "absolute",
                    left: "8.33%",
                    right: "8.33%",
                    top: "12.5%",
                    bottom: "12.5%",
                    borderWidth: 1.8,
                    borderColor: "#1F1F1F",
                  }}
                />
              </View>
              <Text
                style={{
                  width: 70,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 11,
                  lineHeight: 25,
                  color: "#1F1F1F",
                }}
              >
                Communities
              </Text>
            </View>

            {/* Plus Button (Center) */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 8.67,
                paddingHorizontal: 25.13,
                gap: 6.93,
                width: 52,
                height: 52,
                backgroundColor: "#000000",
                borderRadius: 1040,
              }}
            >
              <View style={{ width: 20.8, height: 20.8 }}>
                {/* Plus Icon */}
                <View
                  style={{
                    position: "absolute",
                    left: "12.49%",
                    right: "12.51%",
                    top: "12.5%",
                    bottom: "12.5%",
                    borderWidth: 1.73,
                    borderColor: "#FFFFFF",
                  }}
                />
              </View>
            </View>

            {/* Shop */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                width: 63,
                height: 46.6,
              }}
            >
              <View style={{ width: 21.6, height: 21.6 }}>
                {/* Shop Icon */}
                <View
                  style={{
                    position: "absolute",
                    left: "11.82%",
                    right: "11.82%",
                    top: "8.33%",
                    bottom: "8.33%",
                    borderWidth: 1.8,
                    borderColor: "#1F1F1F",
                  }}
                />
              </View>
              <Text
                style={{
                  width: 28,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 11,
                  lineHeight: 25,
                  color: "#1F1F1F",
                }}
              >
                Shop
              </Text>
            </View>

            {/* Account */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                width: 63,
                height: 46.6,
              }}
            >
              <View style={{ width: 21.6, height: 21.6 }}>
                {/* Account Icon */}
                <View
                  style={{
                    position: "absolute",
                    left: "15.18%",
                    right: "15.18%",
                    top: "62.5%",
                    bottom: "12.5%",
                    borderWidth: 1.8,
                    borderColor: "#1F1F1F",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: "31.25%",
                    right: "31.25%",
                    top: "12.5%",
                    bottom: "50%",
                    borderWidth: 1.8,
                    borderColor: "#1F1F1F",
                  }}
                />
              </View>
              <Text
                style={{
                  width: 44,
                  height: 25,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: 11,
                  lineHeight: 25,
                  color: "#1F1F1F",
                }}
              >
                Account
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}