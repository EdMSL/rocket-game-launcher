import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';
import path from 'path';
import fs from 'fs';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import {
  readINIFile, readJSONFile, writeINIFile,
} from '$utils/files';
import { IUnwrap } from '$types/common';
import {
  addMessages, setIsGameSettingsAvailable, setIsGameSettingsLoaded,
} from '$actions/main';
import { GAME_SETTINGS_PATH } from '$constants/paths';
import { checkGameSettingsFile } from '$utils/check';
import { IGameSettingsConfig } from '$reducers/gameSettings';
import { LogMessageType, writeToLogFile } from '$utils/log';
import { CreateUserMessage } from '$utils/message';

const getState = (state: IAppState): IAppState => state;

export function* setGameSettingsSaga(): SagaIterator {
  try {
    if (fs.existsSync(GAME_SETTINGS_PATH)) {
      const gameSettingsObj: IGameSettingsConfig = yield call(readJSONFile, GAME_SETTINGS_PATH);
      const checkingMessages = checkGameSettingsFile(gameSettingsObj);

      if (checkingMessages.length > 0) {
        yield put(addMessages(checkingMessages));
      }

      // Определяем, будет ли доступен раздел настроек
      yield put(setIsGameSettingsAvailable(
        !checkingMessages.some((currentMsg) => currentMsg.type === 'error'),
      ));
    } else {
      writeToLogFile('Game settings file settings.json not found.');
    }

    // return gameSettingsObj;
  } catch (error) {
    yield put(addMessages([CreateUserMessage.error('Ошибка обработки файла settings.json. Игровые настройки будут недоступны. Подробности в файле лога')])); //eslint-disable-line max-len

    writeToLogFile(
      `An error occurred while processing the file settings.json. ${error.message}`,
      LogMessageType.ERROR,
    );
  }
}

export function* initSettingsSaga(): SagaIterator {
  try {
    yield call(setIsGameSettingsLoaded, false);

    const file: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve('./src/tests/fixtures/Blockhead.ini'),
    );

    file.addSection('Section #9');

    yield call(writeINIFile, path.resolve('./src/tests/fixtures/Blockhead.ini'), file);
  } catch (error) {
    console.log(error.message);
  } finally {
    yield call(setIsGameSettingsLoaded, true);
  }
}

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  if (location.hash === `#${Routes.GAME_SETTINGS_SCREEN}`) {
    yield call(initSettingsSaga);
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
