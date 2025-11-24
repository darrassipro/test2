import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

/**
 * Configuration personnalisée des toasts pour l'application Ajiw
 * Style aligné avec la palette de couleurs de la plateforme (#E91E63)
 */
export const toastConfig = {
  /**
   * Toast de succès
   */
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),

  /**
   * Toast d'erreur
   */
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),

  /**
   * Toast d'information
   */
  info: (props: any) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#10B981', // Vert pour le succès
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    height: 'auto',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorToast: {
    borderLeftColor: '#EF4444', // Rouge pour les erreurs
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    height: 'auto',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoToast: {
    borderLeftColor: '#E91E63', // Rose Ajiw pour les infos
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    height: 'auto',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    color: '#030014',
  },
  text2: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});

