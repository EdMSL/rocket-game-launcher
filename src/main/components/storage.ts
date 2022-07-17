import Storage from 'electron-store';
import { Store } from 'redux';
import path from 'path';
import {
  app, ipcMain, dialog,
} from 'electron';
import fs from 'fs';

import { configureAppStore, IAppState } from '$store/store';
import { IUserSettingsRootState } from '$types/userSettings';
import { defaultLauncherConfig, defaultModOrganizerParams } from '$constants/defaultData';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import {
  getUserThemesFolders,
  readJSONFileSync,
  writeJSONFile,
} from '$utils/files';
import {
  CONFIG_FILE_PATH,
  GAME_DIR,
  GAME_SETTINGS_FILE_PATH,
} from '$constants/paths';
import {
  CustomError,
  ErrorName,
  ReadWriteError,
} from '$utils/errors';
import { checkLauncherConfigFileData, checkObjectForEqual } from '$utils/check';
import { getObjectAsList } from '$utils/strings';
import {
  createPathVariables,
  getCustomButtons,
  getUserThemes,
} from '$utils/data';
import { INITIAL_STATE as mainInitialState } from '$reducers/main';
import { INITIAL_STATE as userSettingsInitialState } from '$reducers/userSettings';
import { ILauncherConfig } from '$types/main';
import { CreateUserMessage } from '$utils/message';
import { AppChannel, Scope } from '$constants/misc';
import { IUserMessage } from '$types/common';

interface IStorage {
  userSettings: IUserSettingsRootState,
}

const saveToStorageParams = ['userSettings'];

const getConfigurationData = (): [ILauncherConfig, boolean] => {
  // Считываем данные из файла конфигурации лаунчера. Эти данные затем передаются в стейт Redux.
  // Если файл не найден, то создаем новый с дефолтными настройками.
  try {
    const configData = readJSONFileSync<ILauncherConfig>(CONFIG_FILE_PATH);

    return [configData, false];
  } catch (error: any) {
    if (error instanceof ReadWriteError) {
      if (error.causeName === ErrorName.NOT_FOUND) {
        writeToLogFileSync(
          'Launcher config file not found. Load default values. A new config file will be created.', //eslint-disable-line max-len
          LogMessageType.WARNING,
        );

        writeJSONFile(CONFIG_FILE_PATH, defaultLauncherConfig)
          .then(() => {
            writeToLogFile('New config file config.json successfully created.');
          })
          .catch(() => {
            writeToLogFile('New config file config.json not created.', LogMessageType.WARNING);
          });

        return [defaultLauncherConfig, true];
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
  * Функция для создания файла настроек пользователя и хранилища Redux.
*/
export const createStorage = (): Store<IAppState> => {
  const messages: IUserMessage[] = [];
  const [configurationFileData, isNewFile] = getConfigurationData();

  if (isNewFile) {
    messages.push(CreateUserMessage.info('Файл конфигурации не найден. Загружены значения по умолчанию.')); //eslint-disable-line max-len
  }

  const configurationData = checkLauncherConfigFileData(configurationFileData);

  let isGameSettingsAvailable = true;

  // Создаем хранилище пользовательских настроек (настройки темы и т.п.).
  // Хранилище располагается в файле user.json в корне программы.
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

  // Обработка файла user.json
  const userSettingsStorage = storage.get('userSettings');

  const userThemes = getUserThemes(getUserThemesFolders());

  if (Object.keys(userThemes).length === 1 && userSettingsStorage.theme !== '') {
    writeToLogFile(
      'No themes found, but user theme is set in storage. Theme will be set to default.',
      LogMessageType.WARNING,
    );
    messages.push(CreateUserMessage.warning('Не найдена выбранная пользовательская тема оформления. Установлена тема по умолчанию.')); //eslint-disable-line max-len

    // Игнорируем перезапись ReadOnly, т.к. это еще не state.
    //@ts-ignore
    userSettingsStorage.theme = '';
    storage.set('userSettings.theme', '');
  }

  // Обработка данных Mod Organizer
  if (configurationData.modOrganizer?.isUsed) {
    //@ts-ignore
    configurationData.modOrganizer = {
      ...defaultModOrganizerParams,
      ...configurationData.modOrganizer,
    };
  }

  // Переменные путей и настройка кнопок
  const [pathVariables, errorText] = createPathVariables(
    configurationData,
    app,
  );

  if (errorText) {
    isGameSettingsAvailable = false;
    messages.push(CreateUserMessage.error(errorText)); //eslint-disable-line max-len
  }

  if (!configurationData.playButton.path && !configurationData.isFirstLaunch) {
    messages.push(CreateUserMessage.warning('Не указан путь для файла запуска игры.')); //eslint-disable-line max-len
  }

  if (configurationData.customButtons.length > 0) {
    const newButtons = getCustomButtons(configurationData.customButtons, pathVariables);

    if (configurationData.customButtons.length !== newButtons.length) {
      messages.push(CreateUserMessage.warning('В процессе обработки списка пользовательских кнопок возникла ошибка. Не все кнопки будут доступны. Подробности в файле лога.')); //eslint-disable-line max-len
    }

    //@ts-ignore
    configurationData.customButtons = newButtons;
  }

  let isGameSettingsFileExists = true;

  if (!fs.existsSync(GAME_SETTINGS_FILE_PATH)) {
    isGameSettingsFileExists = false;
  }

  // Генерация state без gameSettings.
  const newStore = {
    userSettings: {
      ...userSettingsInitialState,
      ...userSettingsStorage,
    },
    main: {
      ...mainInitialState,
      config: {
        ...configurationData,
        modOrganizer: {
          ...mainInitialState.config.modOrganizer,
          ...configurationData.modOrganizer,
        },
        playButton: {
          ...mainInitialState.config.playButton,
          ...configurationData.playButton,
        },
      },
      isGameSettingsFileExists,
      isGameSettingsAvailable,
      isDevWindowOpening: configurationData.isFirstLaunch,
      launcherVersion: app.getVersion(),
      pathVariables,
      userThemes,
      messages,
    },
  };

  const appStore = configureAppStore(newStore, Scope.MAIN).store;

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

    // `storage.set` записывает данные в файл. При каждом изменении `state` происходит запись.
    // Чтобы избежать этого, обновляем `storage` только при изменении данных.
    if (!checkObjectForEqual(
      storage.get('userSettings'),
      (newStorageData as IStorage).userSettings,
    )) {
      storage.set(newStorageData);
    }
  });

  ipcMain.handle(AppChannel.GET_APP_STATE, () => appStore.getState());

  writeToLogFileSync(`Working directory: ${GAME_DIR}`);
  writeToLogFileSync(`Paths variables:\n  ${getObjectAsList(pathVariables, true)}`);

  if (configurationFileData.modOrganizer) {
    writeToLogFileSync(`MO information:\n  ${getObjectAsList(configurationFileData.modOrganizer!, true)}`); //eslint-disable-line max-len
  }

  return appStore;
};
