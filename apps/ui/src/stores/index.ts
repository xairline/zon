import { createContext, useContext } from 'react';
import { pilotStore } from './pilot.store';
import { routerStore } from './router.store';
import { flightStore } from './flight.store';
import { datarefStore } from './dataref.store';

export const rootStoreContext = createContext({
  PilotStore: pilotStore,
  RouterStore: routerStore,
  FlightStore: flightStore,
  DatarefStore: datarefStore,
});

export const useGlobalStores = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useGlobalStores must be used winin a provider');
  }
  return store;
};
