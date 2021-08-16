import { GAME_SETTINGS_CONFIG_ALL, GAME_SETTINGS_CONFIG_REQUIRE } from '$constants/misc';
import { IGameSettingsConfig } from '$reducers/gameSettings';
import { IMessage } from '$reducers/main';
import { writeToLogFile } from './log';
import { getRandomId } from './strings';

export const checkGameSettingsFileBaseFields = (configObj: IGameSettingsConfig): IMessage[] => {
  const messages: IMessage[] = [];
  const logMessages: string[] = [];
  const ignoredKeys: string[] = [];

  // Отфильтруем невалидные поля.
  const filteredObjKeys = Object.keys(configObj).filter((currentKey) => {
    if (!GAME_SETTINGS_CONFIG_ALL.includes(currentKey)) {
      ignoredKeys.push(currentKey);

      return false;
    }

    return true;
  });

  if (ignoredKeys.length > 0) {
    messages.push({
      id: getRandomId('check'),
      status: 'warning',
      text: `Найдены некорректные поля в файле игровых настроек: ${ignoredKeys}`,
    });
    logMessages.push(`Invalid fields detected on settings.json: ${ignoredKeys}`);
  }
  ///TODO сделать settingGroups опциональным
  if (configObj.settingGroups && configObj.usedFiles) {
    if (Object.keys(configObj.usedFiles).length === 0) {
      messages.push({
        id: getRandomId('check'),
        status: 'warning',
        text: 'В файл игровых настроек не добавлено ни одного фала.',
      });
      logMessages.push('No game settings files on settings.json');
    }
  } else {
    const missedRequredFields = GAME_SETTINGS_CONFIG_REQUIRE.filter(
      (currKey) => !filteredObjKeys.includes(currKey),
    );

    messages.push({
      id: getRandomId('check'),
      status: 'error',
      text: `Отсутствуют необходимые поля в файле игровых настроек: ${missedRequredFields}. Игровые настройки будут недоступны.`, //eslint-disable-line max-len
    });
    logMessages.push(`Missed required fields on settings.json: ${missedRequredFields}`);
  }

  writeToLogFile(logMessages.reduce(
    (totalMessage, currentMessage) => `${totalMessage}\n${currentMessage}`,
  ), '');

  return messages;
};
