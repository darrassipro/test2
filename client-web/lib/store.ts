import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/baseApi';
// Import endpoint files to trigger injections
import './api/authApi';
import './api/userApi';
import './api/communityApi';
import './api/postApi';
import './api/adminApi';
import './api/bookingApi';

const configurestore = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'api/subscriptions/unsubscribeQueryResult',
          'api/mutations/removeMutationResult',
        ],
      },
    }).concat(api.middleware),
});

export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;
