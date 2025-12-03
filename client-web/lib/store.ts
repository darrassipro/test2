import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/baseApi';
import { userApi } from './api/userApi';
// Import endpoint files to trigger injections
import './api/authApi';
import './api/userApi';
import './api/communityApi';
import './api/postApi';
import './api/adminApi';
import './api/bookingApi';
import editorReducer from '../services/slices/editorSlice';
import pageTreeReducer from '../services/slices/pageTreeSlice';
// import { templateApi } from '../services/api/templateApi'; // À décommenter quand templateApi sera créé

export const store = configureStore({
  reducer: {
    // Website builder reducers
    editor: editorReducer,
    pageTree: pageTreeReducer,
    // API reducers
    [api.reducerPath]: api.reducer,
    // [bookingApi.reducerPath]: bookingApi.reducer,
    // [templateApi.reducerPath]: templateApi.reducer, // À décommenter quand templateApi sera créé
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'api/subscriptions/unsubscribeQueryResult',
          'api/mutations/removeMutationResult',
        ],
      },
    }).concat(
      api.middleware,
      // bookingApi.middleware,
      // templateApi.middleware // À décommenter quand templateApi sera créé
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
