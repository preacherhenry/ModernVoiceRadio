import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { STORAGE_KEYS } from '@constants/config';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import playerReducer from './slices/playerSlice';
import { setStoreRef } from './storeAccessor';

// Only durable user *preferences* are persisted to disk. Auth tokens live in
// expo-secure-store (see authSlice's restoreSession/persistTokens), and RTK Query's
// cache is intentionally not persisted — it refetches fresh on app start.
//
// A single outer persistReducer (below) handles this via `whitelist: ['settings']` —
// do NOT also wrap settingsReducer in its own nested persistReducer here. Doing both
// double-persists the same AsyncStorage key and makes rehydration race against itself,
// which is what was causing "redux-persist: rehydrate for 'settings' called after
// timeout" on physical devices.
const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  player: playerReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistConfig = {
  key: STORAGE_KEYS.REDUX_PERSIST,
  storage: AsyncStorage,
  whitelist: ['settings'],
  timeout: 0,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    // Both checks are dev-only (stripped from production builds entirely) and exist to
    // catch real bugs (non-serializable values in state, mutated state). As the RTK
    // Query cache has grown with more endpoints, the checks' default 32ms warning
    // threshold started firing on normal, non-buggy state — raised rather than disabled,
    // so a genuine regression can still trip it.
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      warnAfter: 128,
    },
    immutableCheck: {
      warnAfter: 128,
    },
  }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
setStoreRef(store);
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
