import Storage from 'electron-store';

import { configureStore } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherResolution } from '$constants/defaultParameters';

interface IStorage {
  settings: {
    userSettings: IUserSettingsRootState,
  }
}

const storage = new Storage<IStorage>({
  defaults: {
    settings: {
      userSettings: {
        resolution: defaultLauncherResolution,
      },
    },
  },
});

const saveToStorageParams = ['userSettings'];

export const createStorage = (): void => {
  const storageSettings = storage.get('settings');
  console.log(storageSettings);

  global['state'] = storageSettings;

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
