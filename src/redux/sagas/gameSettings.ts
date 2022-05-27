import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
  all,
  SagaReturnType,
  delay,
} from 'redux-saga/effects';
import Joi from 'joi';

import { IAppState } from '$store/store';
import {
  isDataFromIniFile,
  readDirectory,
  readGameSettingsFile,
  readINIFile,
  readJSONFile,
  writeGameSettingsFile,
  writeINIFile,
  xmlAttributePrefix,
} from '$utils/files';
import { IGetDataFromFilesResult, IUnwrap } from '$types/common';
import {
  addMessages,
  setIsGameSettingsAvailable,
  setIsGameSettingsLoaded,
  setIsGameSettingsLoading,
  setIsGameSettingsSaving,
  setIsGameSettingsConfigChanged,
  setIsGameSettingsFileExists,
} from '$actions/main';
import { GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { checkGameSettingsConfigFull, ICheckResult } from '$utils/check';
import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsFile,
  IGameSettingsParameters,
  IGameSettingsOption,
} from '$types/gameSettings';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { CreateUserMessage } from '$utils/message';
import {
  changeMoProfile,
  setGameSettingsConfig,
  setGameSettingsParameters,
  setGameSettingsFiles,
  setMoProfile,
  setMoProfiles,
  saveGameSettingsFiles,
  setGameSettingsOptions,
  setInitialGameSettingsOptions,
} from '$actions/gameSettings';
import {
  CustomError,
  ErrorName,
  ReadWriteError,
  SagaError,
} from '$utils/errors';
import {
  changeLineIniParameterStr,
  changeSectionalIniParameterStr,
  generateGameSettingsParameters,
  getFileByFileName,
  getGameSettingsParametersWithNewValues,
  setValueForObjectDeepKey,
} from '$utils/data';
import {
  PathRegExp,
  Encoding,
  GameSettingsFileView,
  modOrganizerProfileSection,
  modOrganizerProfileParam,
} from '$constants/misc';
import {
  getRegExpForLineIniParameter,
  getPathToFile,
} from '$utils/strings';

export interface IIncorrectGameSettingsFiles {
  [key: string]: number[],
}

const getState = (state: IAppState): IAppState => state;

/**
 * Получить данные из файла игровых настроек
 * settings.json и проверить данные на валидность.
 * @returns Объект с данными из settings.json и ошибками валидации.
*/
export function* getGameSettingsConfigSaga(): SagaIterator<ICheckResult<IGameSettingsConfig>> {
  try {
    const gameSettingsObj: IGameSettingsConfig = yield call(readJSONFile, GAME_SETTINGS_FILE_PATH, false);
    yield delay(2000);
    yield put(setIsGameSettingsFileExists(true));

    return checkGameSettingsConfigFull(gameSettingsObj);
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path: '${error.path}'.`;

      if (error.causeName === ErrorName.NOT_FOUND) {
        yield put(setIsGameSettingsFileExists(false));
      }
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    throw new SagaError('Get game settings config saga', errorMessage, error);
  }
}

/**
 * Получить список профилей Mod Organizer и записать в `state`
*/
function* getMOProfilesSaga(): SagaIterator {
  const {
    main: { pathVariables },
  }: ReturnType<typeof getState> = yield select(getState);

  try {
    const profiles: IUnwrap<typeof readDirectory> = yield call(
      readDirectory,
      pathVariables['%MO_PROFILE%'],
    );

    if (profiles.length > 0) {
      yield put(setMoProfiles(profiles));
    } else {
      throw new CustomError('There are no profiles in the profiles folder.');
    }
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${pathVariables['%MO_PROFILE%']}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    throw new SagaError('Get Mod Organizer profiles', errorMessage, error);
  }
}

/**
 * Получить данные из файла ModOrganizer.ini и записать нужные параметры в `state`
 * @returns Строка с профилем ModOrganizer
*/
function* getDataFromMOIniSaga(): SagaIterator<string> {
  try {
    const {
      main: {
        config: {
          modOrganizer: {
            version,
          },
        },
        pathVariables,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const iniData: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      pathVariables['%MO_INI%'],
    );

    const currentMOProfileIniSection = iniData.getSection(modOrganizerProfileSection);

    if (currentMOProfileIniSection) {
      const profileName = currentMOProfileIniSection.getValue(modOrganizerProfileParam);

      if (profileName) {
        if (version === 1) {
          return profileName.toString();
        }

        if (version === 2) {
          return profileName.match(/@ByteArray\((.+)\)/)![1];
        }

        return profileName.toString();
      }

      throw new CustomError('profileName');
    } else {
      throw new CustomError('modOrganizerProfileSection');
    }
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      yield put(setMoProfile(''));

      errorMessage = `Can't get current Mod Organizer profile. Problem with: ${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    yield put(addMessages([CreateUserMessage.error(
      'Не удалось получить текущий профиль Mod Organizer. Настройки из файлов, привязанных к профилю, будут недоступны. Подробности в файле лога.', //eslint-disable-line max-len
    )]));

    throw new SagaError('Get data from Mod Organizer INI file', errorMessage, error);
  }
}

/**
 * Считывает данные из файлов для генерации игровых опций
 * @param filesForRead Игровые файлы, из которых нужно получить данные.
 * @param isWithPrefix Нужно ли добавлять префикс к именам атрибутов. По умолчанию `false`.
*/
function* getDataFromGameSettingsFilesSaga(
  filesForRead: IGameSettingsFile[],
  moProfile: string,
  isWithPrefix = false,
): SagaIterator<IGetDataFromFilesResult> {
  try {
    const {
      main: { pathVariables },
      gameSettings: { baseFilesEncoding },
    }: ReturnType<typeof getState> = yield select(getState);

    const currentFilesData: IUnwrap<typeof readGameSettingsFile>[] = yield all(
      filesForRead.map((file) => call(
        readGameSettingsFile,
        file,
        pathVariables,
        moProfile,
        baseFilesEncoding,
        isWithPrefix,
      )),
    );

    return currentFilesData.reduce<IGetDataFromFilesResult>(
      (filesData, currentFile) => ({
        ...filesData,
        ...currentFile,
      }),
      {},
    );
  } catch (error: any) {
    throw new SagaError('Get data from game settings files', error.message, error);
  }
}

/**
 * Генерирует список игровых опций на основе параметров
 * (`gameSettingsFiles`) из файлов, указанных в settings.json
 * @param gameSettingsFiles Массив объектов игровых файлов.
 * @param gameSettingsOptions Игровые параметры для генерации опций.
 * @param moProfile Профиль Mod Organizer.
*/
export function* generateGameSettingsParametersSaga(
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsOptions: IGameSettingsOption[],
  moProfile: string,
): SagaIterator<{
  gameSettingsParameters: IGameSettingsParameters,
  optionsWithError: string[],
}> {
  try {
    const currentFilesDataObj: SagaReturnType<typeof getDataFromGameSettingsFilesSaga> = yield call(
      getDataFromGameSettingsFilesSaga,
      gameSettingsFiles,
      moProfile,
    );

    const {
      data: totalGameSettingsParameters, errors, optionsWithError,
    } = generateGameSettingsParameters(
      gameSettingsOptions,
      gameSettingsFiles,
      currentFilesDataObj,
      moProfile,
    );

    if (errors.length > 0) {
      errors.forEach((message) => {
        writeToLogFile(message.text, LogMessageType.WARNING);
      });
    }

    return { gameSettingsParameters: totalGameSettingsParameters, optionsWithError };
  } catch (error: any) {
    throw new SagaError('Generate game settings parameters', error.message, error);
  }
}

/**
 * Инициализация игровых настроек. Получаем данные МО,
 * проверяем на валидность параметры игровых настроек (`gameSettingsOptions`),
 * генерируем параметры игровых настроек.
 * @param isFromUpdateAction Обновление настроек или первичная инициализация.
*/
export function* initGameSettingsSaga(
  isFromUpdateAction = false,
  initialSettingsConfig?: IGameSettingsConfig,
): SagaIterator {
  try {
    yield put(setIsGameSettingsLoading(true));
    yield put(setIsGameSettingsLoaded(false));

    if (!isFromUpdateAction) {
      writeToLogFileSync('Game settings initialization started.');
    }

    const {
      main: {
        config: {
          modOrganizer: {
            isUsed: isMOUsed,
          },
        },
        isGameSettingsConfigChanged,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    let currentSettingsConfig: IGameSettingsConfig;
    let settingsConfigErrors: Joi.ValidationError[] = [];

    if (initialSettingsConfig) {
      currentSettingsConfig = initialSettingsConfig;
    } else {
      const {
        data,
        errors,
      }: SagaReturnType<typeof getGameSettingsConfigSaga> = yield call(getGameSettingsConfigSaga);

      currentSettingsConfig = data;
      settingsConfigErrors = [...errors];
    }

    let moProfile: string = '';

    if (isMOUsed) {
      yield call(getMOProfilesSaga);

      moProfile = yield call(getDataFromMOIniSaga);
      yield put(setMoProfile(moProfile));
    }

    if (currentSettingsConfig.gameSettingsOptions.length > 0) {
      const {
        gameSettingsParameters, optionsWithError,
      }: SagaReturnType<typeof generateGameSettingsParametersSaga> = yield call(
        generateGameSettingsParametersSaga,
        currentSettingsConfig.gameSettingsFiles,
        currentSettingsConfig.gameSettingsOptions,
        moProfile,
      );

      if (!initialSettingsConfig && !isFromUpdateAction) {
        yield put(setInitialGameSettingsOptions(currentSettingsConfig.gameSettingsOptions));
      }

      if (optionsWithError.length > 0 || settingsConfigErrors?.length > 0) {
        const filteredGameSettingsOptions = currentSettingsConfig.gameSettingsOptions.filter(
          (currentParam) => !optionsWithError.includes(currentParam.id),
        );

        if (filteredGameSettingsOptions.length === 0) {
          yield put(addMessages([CreateUserMessage.error('Нет доступных опций для вывода. Ни один параметр в файле игровых настроек settings.json не может быть обработан из-за ошибок. Подробности в файле лога.')])); //eslint-disable-line max-len
        } else {
          yield put(addMessages([CreateUserMessage.warning('Обнаружены ошибки в файле игровых настроек settings.json. Некоторые опции будут недоступны. Подробности в файле лога.')])); //eslint-disable-line max-len
        }

        currentSettingsConfig.gameSettingsOptions = [...filteredGameSettingsOptions];
      }

      yield put(setGameSettingsParameters(gameSettingsParameters));
    }

    yield put(setGameSettingsConfig(currentSettingsConfig));
    yield put(setIsGameSettingsAvailable(true));
    yield put(setIsGameSettingsLoaded(true));

    if (isGameSettingsConfigChanged) {
      yield put(setIsGameSettingsConfigChanged(false));
    }

    if (!isFromUpdateAction) {
      writeToLogFileSync('Game settings initialisation completed.');
    }
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path "${error.path}".`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    if (!isFromUpdateAction) {
      writeToLogFileSync(
        `Failed to initialize game settings. Reason: ${errorMessage}`,
        LogMessageType.ERROR,
      );

      yield put(addMessages([CreateUserMessage.error('Произошла ошибка в процессе генерации игровых настроек. Подробности в файле лога.')]));//eslint-disable-line max-len
    }

    yield put(setGameSettingsParameters({}));
    yield put(setGameSettingsFiles([]));
    yield put(setGameSettingsOptions([]));
    yield put(setIsGameSettingsLoaded(false));

    if (isFromUpdateAction) {
      throw new SagaError('Init game settings', errorMessage, error);
    }
  } finally {
    if (!isFromUpdateAction) {
      yield put(setIsGameSettingsLoading(false));
    }
  }
}

/**
 * Изменяет текущий профиль Mod Organizer на другой, записывая изменения в файл.
 * @param newMOProfile Имя профиля.
*/
function* changeMOProfileSaga(
  { payload: newMOProfile }: ReturnType<typeof changeMoProfile>,
): SagaIterator {
  try {
    yield put(setIsGameSettingsLoaded(false));

    const {
      gameSettings: {
        gameSettingsFiles, gameSettingsOptions, gameSettingsParameters,
      },
      main: {
        config: {
          modOrganizer: {
            version,
          },
        },
        pathVariables,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const iniData: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      pathVariables['%MO_INI%'],
    );

    changeSectionalIniParameterStr(
      iniData,
      modOrganizerProfileSection,
      modOrganizerProfileParam,
      version === 1 ? newMOProfile : `@ByteArray(${newMOProfile})`,
    );

    yield call(
      writeINIFile,
      pathVariables['%MO_INI%'],
      iniData,
      Encoding.WIN1251,
    );

    const MOProfileGameSettingsOnly = gameSettingsFiles.filter((file) => PathRegExp.MO_PROFILE.test(file.path));
    const availableFileNames = MOProfileGameSettingsOnly.map((file) => file.name);
    const filteredGameSettingOptions = gameSettingsOptions.filter((currentOption) => availableFileNames.includes(currentOption.file));

    const { gameSettingsParameters: moProfileGameSettingsParameters }: SagaReturnType<typeof generateGameSettingsParametersSaga> = yield call(
      generateGameSettingsParametersSaga,
      MOProfileGameSettingsOnly,
      filteredGameSettingOptions,
      newMOProfile,
    );

    yield put(setMoProfile(newMOProfile));
    yield put(setGameSettingsParameters({
      ...gameSettingsParameters,
      ...moProfileGameSettingsParameters,
    }));
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to change current Mod Organizer profile . Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при изменении профиля Mod Organizer. Подробности в файле лога.')]));//eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsLoaded(true));
  }
}

/**
 * Сохранить изменения в файлах игровых настроек.
 * @param changedGameSettingsParameters Измененные игровые параметры.
*/
function* writeGameSettingsFilesSaga(
  { payload: changedGameSettingsParameters }: ReturnType<typeof saveGameSettingsFiles>,
): SagaIterator {
  try {
    yield put(setIsGameSettingsSaving(true));

    const {
      gameSettings: {
        baseFilesEncoding,
        gameSettingsFiles,
        gameSettingsParameters,
        moProfile,
      },
      main: { pathVariables },
    }: ReturnType<typeof getState> = yield select(getState);
    const changedGameSettingsFiles = Array.from(
      new Set(
        Object.values(changedGameSettingsParameters)
          .map((parameter) => getFileByFileName(gameSettingsFiles, parameter.file)!),
      ),
    );

    const currentFilesData: SagaReturnType<typeof getDataFromGameSettingsFilesSaga> = yield call(
      getDataFromGameSettingsFilesSaga,
      changedGameSettingsFiles,
      moProfile,
      true,
    );

    const filesForWrite = changedGameSettingsFiles.map((file) => {
      const changedGameSettingsParametersId = Object.keys(changedGameSettingsParameters);
      const currWriteFileContent = currentFilesData[file.name];
      const currWriteFileView = file.view;

      changedGameSettingsParametersId.forEach((parameterId) => {
        const currentParameter = changedGameSettingsParameters[parameterId];

        if (
          currWriteFileView === GameSettingsFileView.SECTIONAL
          && isDataFromIniFile(currWriteFileView, currWriteFileContent)
        ) {
          const parameterNameParts = currentParameter.name.split('/');

          changeSectionalIniParameterStr(
            currWriteFileContent,
            parameterNameParts[0],
            parameterNameParts[1],
            currentParameter.value,
          );
        } else if (
          currWriteFileView === GameSettingsFileView.LINE
          && isDataFromIniFile(currWriteFileView, currWriteFileContent)
        ) {
          currWriteFileContent.globals.lines.some((line) => {
            if (getRegExpForLineIniParameter(currentParameter.name).test(line.text)) {
              line.text = changeLineIniParameterStr( //eslint-disable-line no-param-reassign
                line.text,
                currentParameter.name,
                changedGameSettingsParameters[parameterId].value,
              );

              return true;
            }

            return false;
          });
        } else if (
          currWriteFileView === GameSettingsFileView.TAG
          && !isDataFromIniFile(currWriteFileView, currWriteFileContent)
        ) {
          const pathArr = [...currentParameter.name.split('/')];

          if (pathArr[pathArr.length - 1] !== '#text') {
            pathArr[pathArr.length - 1] = `${xmlAttributePrefix}${pathArr[pathArr.length - 1]}`;
          }

          setValueForObjectDeepKey(
            currWriteFileContent,
            pathArr,
            changedGameSettingsParameters[parameterId].value,
          );
        }
      });

      return { fileContent: currWriteFileContent, fileData: file };
    });

    yield all(
      filesForWrite.map((file) => call(
        writeGameSettingsFile,
        getPathToFile(file.fileData.path, pathVariables, moProfile),
        file.fileContent,
        file.fileData.view as GameSettingsFileView,
        file.fileData.encoding || baseFilesEncoding,
      )),
    );

    yield put(setGameSettingsParameters({
      ...gameSettingsParameters,
      ...getGameSettingsParametersWithNewValues(changedGameSettingsParameters),
    }));
    yield put(addMessages([CreateUserMessage.success('Настройки успешно сохранены.')]));
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to save game settings. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка в процессе сохранения игровых настроек. Подробности в файле лога.')]));//eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsSaving(false));
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  yield takeLatest(GAME_SETTINGS_TYPES.CHANGE_MO_PROFILE, changeMOProfileSaga);
  yield takeLatest(GAME_SETTINGS_TYPES.SAVE_GAME_SETTINGS_FILES, writeGameSettingsFilesSaga);
}
