import type { Store } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './store';

type AppStore = Store<RootState> & { dispatch: AppDispatch };

/**
 * Breaks the store.ts <-> api/client.ts circular import: the axios interceptor needs
 * read/write access to auth tokens, but the store itself is configured after the API
 * slices are defined. `store.ts` calls setStoreRef(store) once, after creation.
 */
let storeRef: AppStore | null = null;

export const setStoreRef = (store: AppStore) => {
  storeRef = store;
};

export const getStoreRef = (): AppStore => {
  if (!storeRef) throw new Error('Redux store accessed before initialization');
  return storeRef;
};
