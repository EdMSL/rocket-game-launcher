import { screen } from 'electron';
import si from 'systeminformation';

import { UsedFileView } from '$constants/misc';
import { IIniObj } from './files';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from './log';
import { CreateUserMessage, IMessage } from './message';
import { getLineIniParameterValue } from './strings';

const ONE_GB = 1073741824;
const SYMBOLS_TO_TYPE = 8;

/**
 * Получить объект сообщения для вывода пользователю.
 * @param content Текст сообщения.
 * @param status Статус сообщения: `info`, `error`, `warning` или `success`. По-умолчанию `error.`
 * @returns Объект сообщения.
*/

/**
 * Получить информацию о доступных дисплеях и записать их в файл лога.
*/
export const getDisplaysInfo = (): void => {
  const mainDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();

  let result = `Main display info. Resolution: ${mainDisplay.size.width}x${mainDisplay.size.height}, Work Area: ${mainDisplay.workArea.width}x${mainDisplay.workArea.height}, Work Area Size: ${mainDisplay.workAreaSize.width}x${mainDisplay.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len

  if (displays.length > 1) {
    result += '\r\n  All displays:';

    displays.forEach((display, index) => {
      result += `\r\n  ${index}: Resolution: ${display.size.width}x${display.size.height}, Work Area: ${display.workArea.width}x${display.workArea.height}, Work Area Size: ${display.workAreaSize.width}x${display.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len
    });
  }

  writeToLogFileSync(result);
};

/**
 * Получить ифнормацию о системе и записать в файл лога.
*/
export const getSystemInfo = async (): Promise<void> => {
  try {
    const systemData = await si.get({
      cpu: 'manufacturer, brand, speed',
      osInfo: 'distro, arch',
      graphics: 'controllers',
      mem: 'total',
    });

    let result = `System info.\r\n  OS: ${systemData.osInfo.distro}, ${systemData.osInfo.arch}.\r\n  CPU: ${systemData.cpu.manufacturer} ${systemData.cpu.brand}, ${systemData.cpu.speed}GHz.\r\n  Memory: ${(systemData.mem.total / ONE_GB).toFixed(2)}Gb.`; //eslint-disable-line max-len

    if (systemData.graphics.controllers.length > 1) {
      result += '\r\n  Graphic cards:';

      systemData.graphics.controllers.forEach((element, index) => {
        result += `\r\n  ${index}: ${element.vendor} ${element.model} ${element.vram}Mb.`; //eslint-disable-line max-len
      });
    } else {
      result += `\r\n  Graphics: ${systemData.graphics.controllers[0].vendor} ${systemData.graphics.controllers[0].model} ${systemData.graphics.controllers[0].vram}Mb.`; //eslint-disable-line max-len
    }

    writeToLogFile(result);
  } catch (error) {
    writeToLogFile(error.message, LogMessageType.ERROR);
  }
};

/**
 * Получить тип у элемента. В отличие от `typeof` разделяет `array` и `oject`.
 * @param element Элемент, для которого нужно определить тип.
 * @returns Строка с типом элемента.
*/
export const getTypeOfElement = (element: unknown): string => {
  const getElementType = {}.toString;
  const elementType = getElementType.call(element).slice(SYMBOLS_TO_TYPE, -1);
  return elementType;
};

export interface IGeneratedGameSettingsParam {
  paramName: string,
  paramGroup: string,
  paramValue: string,
  paramErrors: IMessage[],
}

export const getParameterData = (
  currentIni: IIniObj,
  currentParam,
  iniType: string,
  iniName: string,
  iniFileName: string,
  moProfileName = '',
): IGeneratedGameSettingsParam => {
  const paramErrors: IMessage[] = [];
  let paramName;
  let paramGroup;
  let paramValue = '';

  if (iniType === UsedFileView.SECTIONAL) {
    paramGroup = currentIni.getSection(currentParam.iniGroup);

    if (!paramGroup) {
      paramErrors.push(CreateUserMessage.warning(
        `${iniFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} не содержит группы параметров "${currentParam.iniGroup}", указанной в параметре ${currentParam.name} из ${iniName}`, //eslint-disable-line max-len
      ));
    } else {
      const parameterLine = paramGroup.getLine(currentParam.name);

      if (parameterLine) {
        paramName = `${paramGroup.name}/${parameterLine.key}`;
        paramValue = parameterLine.value;
      } else {
        paramErrors.push(CreateUserMessage.warning(
          `${iniFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} из группы "${currentParam.iniGroup}" не содержит опции "${currentParam.name}", указанной в параметре ${currentParam.name} из ${iniName}`, //eslint-disable-line max-len
        ));
      }
    }
  } else {
    currentIni.globals.lines.some((line) => {
      paramValue = getLineIniParameterValue(line.text, currentParam.name);

      if (paramValue) {
        paramName = currentParam.name;
      }

      return Boolean(paramValue);
    });

    if (!paramName) {
      paramErrors.push(CreateUserMessage.warning(
        `${iniFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} не содержит опции "${currentParam.name}", указанной в параметре ${currentParam.name} из ${iniName}`, //eslint-disable-line max-len
      ));
    }
  }

  return {
    paramName,
    paramGroup,
    paramValue,
    paramErrors,
  };
};
