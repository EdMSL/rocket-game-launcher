import Storage from 'electron-store';

import { configureStore } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherResolution } from '$constants/defaultParameters';
import { writeToLogFileSync } from '$utils/log';
import { readJSONFileSync } from '$utils/files';
import { configPath } from '$constants/paths';

interface IStorage {
  settings: {
    userSettings: IUserSettingsRootState,
  },
}

const saveToStorageParams = ['userSettings'];

/**
  * Функция для создания файла настроек пользователя и хранилища Redux
*/
export const createStorage = (): void => {
  const configurationData = readJSONFileSync(configPath);

  const storage = new Storage<IStorage>({
    defaults: {
      settings: {
        userSettings: {
          resolution: defaultLauncherResolution,
        },
      },
    },
  });

  const storageSettings = storage.get('settings');

  const newStore = {
    ...storageSettings,
    system: {
      ...configurationData,
    },
  };

  global['state'] = newStore;

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

  writeToLogFileSync(`User settings configuration file in the path ${storage.path} has been successfully created or already exists.`); // eslint-disable-line max-len
};
