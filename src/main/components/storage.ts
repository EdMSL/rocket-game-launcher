import Storage from 'electron-store';

import { configureStore } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherConfig, defaultLauncherResolution } from '$constants/defaultParameters';
import { LOG_MESSAGE_TYPE, writeToLogFileSync } from '$utils/log';
import { readJSONFileSync } from '$utils/files';
import { configPath } from '$constants/paths';
import { ISystemRootState } from '$reducers/system';
import { ErrorTypes, ReadError } from '$utils/errors';

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
  let configurationData: ISystemRootState;

  try {
    configurationData = readJSONFileSync<ISystemRootState>(configPath);
  } catch (error) {
    if (error instanceof ReadError) {
      if (error.cause.name === ErrorTypes.NotFoundError) {
        writeToLogFileSync(
          'Launcher configuration file not found. Reset to default values.',
          LOG_MESSAGE_TYPE.WARNING,
        );

        configurationData = defaultLauncherConfig;
      } else {
        throw new Error('Found problems with config.json. See log for more details.');
      }
    } else {
      throw new Error('Found problems with config.json. See log for more details.');
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
