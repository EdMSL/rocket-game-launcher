import Storage from 'electron-store';

import { configureStore } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherConfig, defaultLauncherResolution } from '$constants/defaultParameters';
import { LOG_MESSAGE_TYPE, writeToLogFile, writeToLogFileSync } from '$utils/log';
import { readJSONFileSync, writeJSONFile } from '$utils/files';
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
  * Функция для создания файла настроек пользователя и хранилища Redux.
*/
export const createStorage = (): void => {
  let configurationData: ISystemRootState;

  try {
    configurationData = readJSONFileSync<ISystemRootState>(configPath);
  } catch (error) {
    if (error instanceof ReadError) {
      if (error.cause.name === ErrorTypes.NotFoundError) {
        writeToLogFileSync(
          'Launcher config file not found. Load default values. A new config file will be created ', //eslint-disable-line max-len
          LOG_MESSAGE_TYPE.WARNING,
        );

        configurationData = defaultLauncherConfig;

        // Асинхронно создаем и записываем новый config.json.
        writeJSONFile(configPath, defaultLauncherConfig)
          .then(() => {
            writeToLogFile('New config file config.json successfully created.');
          })
          .catch(() => {
            writeToLogFile('New config file config.json not created.', LOG_MESSAGE_TYPE.WARNING);
          });
      } else {
        throw new Error('Found problems with config.json. See log for more details.');
      }
    } else {
      throw new Error('Found problems with config.json. See log for more details.');
    }
  }

  // Хранилаще пользовательских настроек.
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
