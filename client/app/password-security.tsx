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

  const handleCancel = () => router.back();

  const handleSave = async () => {
    if (!oldPassword.trim())
      return Alert.alert("Erreur", "Veuillez saisir votre ancien mot de passe");

    if (!newPassword.trim())
      return Alert.alert("Erreur", "Veuillez saisir votre nouveau mot de passe");

    if (newPassword.length < 8)
      return Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 8 caractères");

    if (newPassword !== confirmPassword)
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");

    try {
      await updatePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      }).unwrap();

      Alert.alert("Succès", "Mot de passe mis à jour avec succès", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorMessage = error?.data?.error || "Erreur lors de la mise à jour du mot de passe";
      Alert.alert("Erreur", errorMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />



      {/* Form */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {/* INPUT COMPONENT */}
        {[
          { label: "Old Password", value: oldPassword, set: setOldPassword },
          { label: "New Password", value: newPassword, set: setNewPassword },
          { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword },
        ].map((field, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, marginBottom: 8, color: "#777" }}>{field.label}</Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 14,
              }}
            >
              <TextInput
                placeholder={field.label}
                placeholderTextColor="#A1A0A0"
                secureTextEntry
                value={field.value}
                onChangeText={field.set}
                style={{
                  fontSize: 14,
                  color: "#000",
                }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingHorizontal: 20,
          marginTop: 40,
        }}
      >
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
          }}
        >
          <X size={16} color="#555" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 14, color: "#555", fontWeight: "600" }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={{
            flexDirection: "row",
            backgroundColor: "#E72858",
            paddingVertical: 10,
            paddingHorizontal: 22,
            borderRadius: 100,
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Your bottom nav stays unchanged */}
    </SafeAreaView>
  );
}
