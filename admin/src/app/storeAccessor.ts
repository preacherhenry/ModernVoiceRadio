import type { Store } from '@reduxjs/toolkit';
import type { RootState } from './store';

let storeRef: Store<RootState> | null = null;

export const setStoreRef = (store: Store<RootState>) => { storeRef = store; };

export const getStoreRef = (): Store<RootState> => {
  if (!storeRef) throw new Error('Redux store accessed before initialization');
  return storeRef;
};
