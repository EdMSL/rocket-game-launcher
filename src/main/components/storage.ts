import Storage from 'electron-store';
import { Store } from 'redux';
import path from 'path';
import fs from 'fs';

import { configureStore, IAppState } from '$store/store';
import { IUserSettingsRootState } from '$types/userSettings';
import {
  defaultLauncherConfig, ILauncherConfig, minimalLauncherConfig,
} from '$constants/defaultParameters';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import {
  getUserThemesFolders,
  readJSONFileSync,
} from '$utils/files';
import {
  CONFIG_FILE_PATH,
  DOCUMENTS_DIR, GAME_DIR,
  DefaultCustomPath,
} from '$constants/paths';
import { ISystemRootState } from '$types/system';
import {
  CustomError,
  ErrorName,
  getReadWriteError,
  ReadWriteError,
} from '$utils/errors';
import { LauncherButtonAction, Scope } from '$constants/misc';
import { checkConfigFileData } from '$utils/check';
import { getObjectAsList, getPathToFile } from '$utils/strings';
import {
  getNewModOrganizerParams, getUserThemes,
} from '$utils/data';
import { INITIAL_STATE as mainInitialState } from '$reducers/main';
import { INITIAL_STATE as systemInitialState } from '$reducers/system';
import { INITIAL_STATE as userSettingsInitialState } from '$reducers/userSettings';
import { IUserMessage } from '$types/main';
import { CreateUserMessage } from '$utils/message';

interface IStorage {
  userSettings: IUserSettingsRootState,
}

interface ICustomPaths {
  '%GAME_DIR%': string,
  //@ts-ignore
  '%DOCUMENTS%'?: string|undefined,
  //@ts-ignore
  '%MO_DIR%'?: string|undefined,
  //@ts-ignore
  '%MO_MODS%'?: string|undefined,
  //@ts-ignore
  '%MO_PROFILE%'?: string|undefined,
  [label: string]: string,
}

const saveToStorageParams = ['userSettings'];

const getConfigurationData = (): ILauncherConfig => {
  // Считываем данные из файла конфигурации лаунчера. Эти данные затем передаются в стейт Redux.
  // Если файл не найден, то создаем новый с дефолтными настройками.
  try {
    const configData = readJSONFileSync<ISystemRootState>(CONFIG_FILE_PATH);

    return configData;
  } catch (error: any) {
    if (error instanceof ReadWriteError) {
      if (error.cause.name === ErrorName.NOT_FOUND) {
        writeToLogFileSync(
          'Launcher config file not found. Load default values. A new config file will be created', //eslint-disable-line max-len
          LogMessageType.WARNING,
        );

        // showMessageBox(
        //   'Will be loaded default values. A new config file will be created',
        //   'Launcher config file not found',
        //   'warning',
        // );

        // writeJSONFile(CONFIG_FILE_PATH, minimalLauncherConfig)
        //   .then(() => {
        //     writeToLogFile('New config file config.json successfully created.');
        //   })
        //   .catch(() => {
        //     writeToLogFile('New config file config.json not created.', LogMessageType.WARNING);
        //   });

        return minimalLauncherConfig;
      }

      throw new Error('Found problems with config.json.');
    } else if (error instanceof CustomError) {
      if (error.name === ErrorName.VALIDATION) {
        writeToLogFileSync(error.message, LogMessageType.ERROR);
      }
    }

    throw new Error('Found problems with config.json.');
  }
};

/**
 * Генерация пользовательских путей с добавлением двух по умолчанию: для папки
 * игры в документах пользователя
 * и папки профилей Mod Organizer, если он используется.
 * @param configData Данные из файла config.json
 * @returns Объект с пользовательскими путями.
*/
const createCustomPaths = (configData: ISystemRootState): ICustomPaths => {
  const newCustomPaths = Object.keys(configData.customPaths).reduce((paths, currentPathKey) => ({
    ...paths,
    [currentPathKey]: path.join(GAME_DIR, configData.customPaths[currentPathKey]),
  }), {});

  return {
    ...DefaultCustomPath,
    ...configData.documentsPath ? {
      '%DOCUMENTS%': path.join(DOCUMENTS_DIR, configData.documentsPath),
    } : {},
    ...configData.modOrganizer.isUsed ? {
      '%MO_DIR%': path.join(GAME_DIR, configData.modOrganizer.path!),
      '%MO_MODS%': path.join(GAME_DIR, configData.modOrganizer.path!, 'mods'),
      '%MO_PROFILE%': path.join(GAME_DIR, configData.modOrganizer.pathToProfiles!),
    } : {},
    ...newCustomPaths,
  };
};

/**
  * Функция для создания файла настроек пользователя и хранилища Redux.
*/
export const createStorage = (): Store<IAppState> => {
  const messages: IUserMessage[] = [];
  const configurationFileData = getConfigurationData();
  const configurationData = checkConfigFileData(configurationFileData);

  // Создаем хранилаще пользовательских настроек (настройки темы и т.п.).
  // Хранилище располагается в файле config.json в папке AppData/ (app.getPath('userData')).
  const storage = new Storage<IStorage>({
    defaults: {
      userSettings: {
        isAutoclose: false,
        theme: '',
      },
    },
    cwd: process.env.NODE_ENV === 'production' ? path.resolve() : path.resolve('./app/files'),
    name: 'user',
  });

  const userSettingsStorage = storage.get('userSettings');

  const userThemes = getUserThemes(getUserThemesFolders());

  if (Object.keys(userThemes).length === 1 && userSettingsStorage.theme !== '') {
    writeToLogFile(
      'No themes found, but user theme is set in storage. Theme will be set to default.',
      LogMessageType.WARNING,
    );

    // Игнорируем перезапись ReadOnly, т.к. это еще не state.
    //@ts-ignore
    userSettingsStorage.theme = '';
    storage.set('userSettings.theme', '');
  }

  if (configurationData.modOrganizer.isUsed) {
    const newModOrganizerParams = getNewModOrganizerParams(configurationData.modOrganizer);

    //@ts-ignore
    configurationData.modOrganizer = newModOrganizerParams;
  }

  const customPaths = createCustomPaths(configurationData);

  configurationData.playButton.path = configurationData.playButton.path ? getPathToFile(
    configurationData.playButton.path,
    customPaths,
    '',
  )
    : defaultLauncherConfig.playButton.path;

  if (!configurationData.playButton.path) {
    messages.push(CreateUserMessage.warning('Не указан путь для файла запуска игры.')); //eslint-disable-line max-len
  }

  if (!configurationData.playButton.label) {
    configurationData.playButton.label = defaultLauncherConfig.playButton.label;
  }

  if (configurationData.customButtons && configurationData.customButtons.length > 0) {
    const newButtons = configurationData.customButtons.map((btn) => {
      try {
        const pathTo = getPathToFile(btn.path, customPaths, '');

        return {
          ...btn,
          action: fs.statSync(pathTo).isDirectory() ? LauncherButtonAction.OPEN : LauncherButtonAction.RUN,
          path: pathTo,
        };
      } catch (error: any) {
        const err = getReadWriteError(error);

        writeToLogFileSync(
          `Can't create custom button. ${btn.label}. ${err.message} Path: ${btn.path}`,
          LogMessageType.WARNING,
        );

        return undefined;
      }
    }).filter(Boolean);

    if (configurationData.customButtons.length !== newButtons.length) {
      messages.push(CreateUserMessage.warning('В процессе обработки списка пользовательских кнопок возникла ошибка. Не все кнопки будут доступны. Подробности в файле лога.')); //eslint-disable-line max-len
    }

    //@ts-ignore
    configurationData.customButtons = newButtons;
  }

  const newStore = {
    userSettings: {
      ...userSettingsInitialState,
      ...userSettingsStorage,
    },
    system: {
      ...systemInitialState,
      ...configurationData,
      modOrganizer: {
        ...systemInitialState.modOrganizer,
        ...configurationData.modOrganizer,
      },
      customPaths: { ...customPaths },
    },
    main: {
      ...mainInitialState,
      userThemes,
      messages,
    },
  };

  /* eslint-disable @typescript-eslint/dot-notation */
  global['state'] = newStore;

  const appStore = configureStore(newStore, Scope.MAIN).store;

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

  writeToLogFileSync(`Working directory: ${GAME_DIR}`);
  writeToLogFileSync(`Custom paths: \n${getObjectAsList(customPaths)}`);

  if (configurationFileData.modOrganizer) {
    writeToLogFileSync(`MO information: \n${getObjectAsList(configurationFileData.modOrganizer!)}`);
  }

  return appStore;
};
