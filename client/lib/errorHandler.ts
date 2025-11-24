import Toast from 'react-native-toast-message';

/**
 * Codes d'erreur possibles des méthodes d'authentification
 */
export enum AuthErrorCode {
  // Erreurs de validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Erreurs d'inscription
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  REGISTRATION_ERROR = 'REGISTRATION_ERROR',
  
  // Erreurs de connexion
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  SOCIAL_LOGIN_REQUIRED = 'SOCIAL_LOGIN_REQUIRED',
  LOGIN_ERROR = 'LOGIN_ERROR',
  
  // Erreurs OTP
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_VERIFIED = 'ALREADY_VERIFIED',
  OTP_NOT_FOUND = 'OTP_NOT_FOUND',
  OTP_EXPIRED = 'OTP_EXPIRED',
  INVALID_OTP = 'INVALID_OTP',
  OTP_VERIFY_ERROR = 'OTP_VERIFY_ERROR',
  EMAIL_SEND_ERROR = 'EMAIL_SEND_ERROR',
  OTP_SEND_ERROR = 'OTP_SEND_ERROR',
}

/**
 * Messages d'erreur personnalisés selon le code d'erreur
 */
const errorMessages: Record<AuthErrorCode | string, { title: string; message: string }> = {
  [AuthErrorCode.VALIDATION_ERROR]: {
    title: 'Erreur de validation',
    message: 'Veuillez vérifier les informations saisies.',
  },
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: {
    title: 'Email déjà utilisé',
    message: 'Un compte existe déjà avec cet email. Essayez de vous connecter.',
  },
  [AuthErrorCode.ACCOUNT_DELETED]: {
    title: 'Compte supprimé',
    message: 'Ce compte a été supprimé. Veuillez contacter le support.',
  },
  [AuthErrorCode.REGISTRATION_ERROR]: {
    title: 'Erreur d\'inscription',
    message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.',
  },
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    title: 'Identifiants incorrects',
    message: 'L\'email ou le mot de passe est incorrect. Veuillez réessayer.',
  },
  [AuthErrorCode.ACCOUNT_INACTIVE]: {
    title: 'Compte désactivé',
    message: 'Ce compte a été désactivé. Veuillez contacter le support.',
  },
  [AuthErrorCode.SOCIAL_LOGIN_REQUIRED]: {
    title: 'Connexion sociale requise',
    message: 'Ce compte utilise une connexion sociale. Veuillez vous connecter avec votre compte social.',
  },
  [AuthErrorCode.LOGIN_ERROR]: {
    title: 'Erreur de connexion',
    message: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
  },
  [AuthErrorCode.USER_NOT_FOUND]: {
    title: 'Compte introuvable',
    message: 'Aucun compte trouvé avec cet email.',
  },
  [AuthErrorCode.ALREADY_VERIFIED]: {
    title: 'Déjà vérifié',
    message: 'Ce compte est déjà vérifié. Vous pouvez vous connecter.',
  },
  [AuthErrorCode.OTP_NOT_FOUND]: {
    title: 'Code OTP introuvable',
    message: 'Aucun code OTP trouvé. Veuillez demander un nouveau code.',
  },
  [AuthErrorCode.OTP_EXPIRED]: {
    title: 'Code OTP expiré',
    message: 'Le code OTP a expiré. Veuillez demander un nouveau code.',
  },
  [AuthErrorCode.INVALID_OTP]: {
    title: 'Code OTP invalide',
    message: 'Le code OTP est incorrect. Veuillez utiliser le code le plus récent reçu par email.',
  },
  [AuthErrorCode.OTP_VERIFY_ERROR]: {
    title: 'Erreur de vérification',
    message: 'Une erreur est survenue lors de la vérification du code OTP. Veuillez réessayer.',
  },
  [AuthErrorCode.EMAIL_SEND_ERROR]: {
    title: 'Erreur d\'envoi',
    message: 'Impossible d\'envoyer l\'email. Veuillez réessayer plus tard.',
  },
  [AuthErrorCode.OTP_SEND_ERROR]: {
    title: 'Erreur d\'envoi',
    message: 'Impossible d\'envoyer le code OTP. Veuillez réessayer.',
  },
  // Erreurs réseau et parsing
  'INVALID_RESPONSE': {
    title: 'Réponse invalide',
    message: 'Le serveur a retourné une réponse invalide. Vérifiez que le serveur est bien démarré et accessible.',
  },
  'NETWORK_ERROR': {
    title: 'Erreur de connexion',
    message: 'Impossible de se connecter au serveur. Vérifiez votre connexion et que le serveur est démarré.',
  },
  'ROUTE_NOT_FOUND': {
    title: 'Route introuvable',
    message: 'La route demandée n\'existe pas sur le serveur.',
  },
};

/**
 * Gère l'affichage des erreurs d'authentification avec des toasts stylés
 * @param error - L'erreur retournée par l'API
 * @param defaultMessage - Message par défaut si l'erreur n'est pas reconnue
 */
export const handleAuthError = (
  error: any,
  defaultMessage: string = 'Une erreur est survenue. Veuillez réessayer.'
) => {
  // Gérer les erreurs réseau spécifiquement
  if (error?.error === 'Network request failed' || error?.message === 'Network request failed' || 
      error?.error?.includes('Network') || error?.message?.includes('Network')) {
    Toast.show({
      type: 'error',
      text1: 'Erreur de connexion',
      text2: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.',
      position: 'top',
      visibilityTime: 5000,
    });
    return;
  }

  // Gérer les erreurs de parsing JSON (quand le serveur retourne du HTML)
  if (error?.error?.includes('JSON') || error?.error?.includes('parse') || 
      error?.message?.includes('JSON') || error?.message?.includes('parse') ||
      error?.message?.includes('unexpected character')) {
    Toast.show({
      type: 'error',
      text1: 'Réponse invalide du serveur',
      text2: 'Le serveur a retourné une réponse non-JSON. Vérifiez que le serveur est bien démarré et que l\'URL est correcte.',
      position: 'top',
      visibilityTime: 5000,
    });
    return;
  }

  // Extraire le code d'erreur et le message
  const errorCode = error?.data?.code || error?.code;
  const errorMessage = error?.data?.error || error?.error || error?.data?.message || error?.message;
  const errorDetails = error?.data?.details;

  // Si on a un code d'erreur reconnu, utiliser le message personnalisé
  if (errorCode && errorMessages[errorCode]) {
    const customError = errorMessages[errorCode];
    
    // Si c'est une erreur de validation avec des détails, les afficher
    if (errorCode === AuthErrorCode.VALIDATION_ERROR && errorDetails && Array.isArray(errorDetails)) {
      const firstError = errorDetails[0];
      const detailMessage = firstError?.msg || firstError?.message || customError.message;
      
      Toast.show({
        type: 'error',
        text1: customError.title,
        text2: detailMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: customError.title,
        text2: customError.message,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  } else {
    // Sinon, utiliser le message d'erreur fourni ou le message par défaut
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: errorMessage || defaultMessage,
      position: 'top',
      visibilityTime: 4000,
    });
  }
};

/**
 * Affiche un toast de succès
 * @param title - Titre du toast
 * @param message - Message du toast
 */
export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

/**
 * Affiche un toast d'information
 * @param title - Titre du toast
 * @param message - Message du toast
 */
export const showInfoToast = (title: string, message?: string) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

