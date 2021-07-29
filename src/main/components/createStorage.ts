import Storage from 'electron-store';

import { configureStore } from '$store/store';

interface IStorage {
  settings: {
    resolution: string,
  }
}

const storage = new Storage<IStorage>({
  defaults: {
    settings: {
      resolution: '1024x768',
    },
  },
});

const saveToStorageParams = ['settings'];
console.log(storage.path);

export const createStorage = (): void => {
  global['state'] = storage.get('settings');

  const store = configureStore(global['state'], 'main');

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
