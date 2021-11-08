import { createContext, useContext } from 'react';
import { pilotStore } from './pilot.store';
import { routerStore } from './router.store';

export const rootStoreContext = createContext({
  PilotStore: pilotStore,
  RouterStore: routerStore,
});

export const useGlobalStores = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useGlobalStores must be used winin a provider');
  }
  return store;
};
