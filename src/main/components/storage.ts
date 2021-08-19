import Storage from 'electron-store';
import { Store } from 'redux';

import { configureStore, IAppState } from '$store/store';
import { IUserSettingsRootState } from '$reducers/userSettings';
import { defaultLauncherConfig, defaultLauncherResolution } from '$constants/defaultParameters';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { readJSONFileSync, writeJSONFile } from '$utils/files';
import { CONFIG_PATH } from '$constants/paths';
import { ISystemRootState } from '$reducers/system';
import {
  ErrorName, ReadWriteError, showMessageBox,
} from '$utils/errors';
import { Scope } from '$constants/misc';

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
    return readJSONFileSync<ISystemRootState>(CONFIG_PATH);
  } catch (error) {
    if (error instanceof ReadWriteError) {
      if (error.cause.name === ErrorName.NOT_FOUND) {
        writeToLogFileSync(
          'Launcher config file not found. Load default values. A new config file will be created', //eslint-disable-line max-len
          LogMessageType.WARNING,
        );

        showMessageBox(
          'Will be loaded default values. A new config file will be created',
          'Launcher config file not found',
          'warning',
        );

        writeJSONFile(CONFIG_PATH, defaultLauncherConfig)
          .then(() => {
            writeToLogFile('New config file config.json successfully created.');
          })
          .catch(() => {
            writeToLogFile('New config file config.json not created.', LogMessageType.WARNING);
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
export const createStorage = (): Store<IAppState> => {
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
      ...defaultLauncherConfig,
      ...configurationData,
    },
  };

  /* eslint-disable @typescript-eslint/dot-notation */
  global['state'] = newStore;

  const appStore = configureStore(global['state'], Scope.MAIN).store;

  appStore.subscribe(() => {
    const currentState = appStore.getState();
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

  if (configurationData.modOrganizer.isUsed) {
    writeToLogFileSync(`MO information. \nPath: ${configurationData.modOrganizer.path}\n  Path to INI: ${configurationData.modOrganizer.pathToINI}\n  Path to profiles: ${configurationData.modOrganizer.pathToProfiles}\n  Profile parameter on INI: ${configurationData.modOrganizer.profileParam}\n  Profile parameter regExp: ${configurationData.modOrganizer.profileParamValueRegExp}`); //eslint-disable-line max-len
  }

  return appStore;
};
