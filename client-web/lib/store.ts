import { configureStore } from '@reduxjs/toolkit';
import userApi from '../services/api/UserApi';
import bookingApi from '../services/api/bookingApi';

const configurestore = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'userApi/subscriptions/unsubscribeQueryResult',
          'userApi/mutations/removeMutationResult',
          'bookingApi/subscriptions/unsubscribeQueryResult',
          'bookingApi/mutations/removeMutationResult',
        ],
      },
    }).concat(userApi.middleware, bookingApi.middleware),
});

export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;
