import Storage from 'electron-store';

import { configureStore } from '$store/store';

interface IStorage {
  settings: any,
}

const storage = new Storage<IStorage>({
  name: 'userSettings',
});
const saveToStorageParams = ['settings'];

export const createStorage = (): void => {
  global['state'] = storage.get('state');

  const store = configureStore(global['state'], 'main');


  // store.subscribe(async() => {
  //   global['state'] = store.getState();
  //   // persist store changes
  //   // TODO: should this be blocking / wait? _.throttle?
  //   await storage.set('state', global['state']);
  // });

  store.subscribe(() => {
    const currentState = store.getState();
    const newStorageData = Object.keys(currentState).reduce((currentParams, param) => {
      if (saveToStorageParams.includes(param)) {
        return {
          ...currentParams,
          [param]: currentState[param],
        };
      }

      return { ...currentParams };
    }, {});

    storage.set(newStorageData);
  });
};

// module.exports = {
//   createStorage,
// };
