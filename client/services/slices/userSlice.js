import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken, removeToken, getRememberMe } from '../../lib/tokenStorage';
import { userApi } from '../userApi';

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true au démarrage pour vérifier l'authentification
  token: null,
};

// Thunk pour vérifier l'authentification au démarrage
export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { dispatch }) => {
    try {
      const rememberMe = await getRememberMe();
      const token = await getToken();
      
      // Si remember me est false, ne pas utiliser le token stocké
      if (!rememberMe && token) {
        await removeToken();
        return { user: null, token: null, isAuthenticated: false };
      }
      
      if (!token) {
        return { user: null, token: null, isAuthenticated: false };
      }

      // Essayer de récupérer l'utilisateur actuel avec le token
      const result = await dispatch(userApi.endpoints.getCurrentUser.initiate());
      
      if (result.data && result.data.success) {
        return {
          user: result.data.data,
          token,
          isAuthenticated: true,
        };
      } else {
        // Token invalide, le supprimer
        await removeToken();
        return { user: null, token: null, isAuthenticated: false };
      }
    } catch (error) {
      // Erreur lors de la vérification, supprimer le token
      await removeToken();
      return { user: null, token: null, isAuthenticated: false };
    }
  }
);

// Thunk pour définir l'utilisateur après login/signup
export const setUserData = createAsyncThunk(
  'user/setUserData',
  async ({ user, token }, { dispatch }) => {
    // Sauvegarder le token (déjà fait dans les pages login/signup, mais on le garde ici pour cohérence)
    return { user, token, isAuthenticated: true };
  }
);

// Thunk pour déconnecter l'utilisateur
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { dispatch }) => {
    await removeToken();
    // Invalider le cache de l'utilisateur
    dispatch(userApi.util.resetApiState());
    return { user: null, token: null, isAuthenticated: false };
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action pour mettre à jour l'utilisateur
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Action pour réinitialiser l'état
    resetUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    // checkAuth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // setUserData
    builder
      .addCase(setUserData.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = false;
      });

    // logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Écouter les mutations de userApi pour mettre à jour l'utilisateur
    builder
      .addMatcher(
        userApi.endpoints.getCurrentUser.matchFulfilled,
        (state, action) => {
          if (action.payload && action.payload.success && action.payload.data) {
            state.user = action.payload.data;
            state.isAuthenticated = true;
          }
        }
      )
      .addMatcher(
        userApi.endpoints.updateUser.matchFulfilled,
        (state, action) => {
          if (action.payload && action.payload.success && action.payload.data) {
            state.user = action.payload.data;
          }
        }
      )
      .addMatcher(
        userApi.endpoints.completeRegistration.matchFulfilled,
        (state, action) => {
          if (action.payload && action.payload.success && action.payload.data) {
            state.user = action.payload.data;
          }
        }
      );
  },
});

export const { updateUser, resetUser } = userSlice.actions;

// Sélecteurs
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsLoading = (state) => state.user.isLoading;
export const selectToken = (state) => state.user.token;

export default userSlice.reducer;