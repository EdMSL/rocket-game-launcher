import Storage from 'electron-store';

import { configureStore } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherConfig, defaultLauncherResolution } from '$constants/defaultParameters';
import {
  LOG_MESSAGE_TYPE,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { readJSONFileSync, writeJSONFile } from '$utils/files';
import { configPath } from '$constants/paths';
import { ISystemRootState } from '$reducers/system';
import { ErrorName, ReadWriteError } from '$utils/errors';

interface IStorage {
  settings: {
    userSettings: IUserSettingsRootState,
  },
}

const saveToStorageParams = ['userSettings'];

const getConfigurationData = () => {
  // Считываем данные из файла конфигурации лаунчера. Эти данные затем передаются в стейт Redux.
  // Если файл не найден, то создаем новый с дефолтными настройками.
  try {
    return readJSONFileSync<ISystemRootState>(configPath);
  } catch (error) {
    if (error instanceof ReadWriteError) {
      if (error.cause.name === ErrorName.NOT_FOUND) {
        writeToLogFileSync(
          'Launcher config file not found. Load default values. A new config file will be created ', //eslint-disable-line max-len
          LOG_MESSAGE_TYPE.WARNING,
        );

        writeJSONFile(configPath, defaultLauncherConfig)
          .then(() => {
            writeToLogFile('New config file config.json successfully created.');
          })
          .catch(() => {
            writeToLogFile('New config file config.json not created.', LOG_MESSAGE_TYPE.WARNING);
          });

        return defaultLauncherConfig;
      }

      throw new Error('Found problems with config.json. See log for more details.');
    }

    throw new Error('Found problems with config.json. See log for more details.');
  }
};
/**
  * Функция для создания файла настроек пользователя и хранилища Redux.
*/
export const createStorage = (): void => {
  const configurationData = getConfigurationData();

  // Создаем хранилаще пользовательских настроек (настройки темы и т.п.).
  // Хранилище располагается в файле config.json в папке AppData/ (app.getPath('userData')).
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

  /* eslint-disable @typescript-eslint/dot-notation */
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
