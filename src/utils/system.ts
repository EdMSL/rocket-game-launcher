import { screen, ipcRenderer } from 'electron';
import si from 'systeminformation';
import debounce from 'lodash.debounce';

import { LogMessageType, writeToLogFile } from './log';
import { AppChannel } from '$constants/misc';
// import ensureError from 'ensure-error';
// import { serializeError } from 'serialize-error';

const ONE_GB = 1073741824;
const DEBOUNCE_DELAY = 200;

/**
 * Получить информацию о доступных дисплеях и записать их в файл лога.
*/
export const getDisplaysInfo = (): void => {
  const mainDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();

  let result = `Displays info.\r\n\tMain display: \r\n\t\tResolution: ${mainDisplay.size.width}x${mainDisplay.size.height}, Work Area: ${mainDisplay.workArea.width}x${mainDisplay.workArea.height}, Work Area Size: ${mainDisplay.workAreaSize.width}x${mainDisplay.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len

  if (displays.length > 1) {
    result += '\r\n\tAll displays:';

    displays.forEach((display, index) => {
      result += `\r\n\t\t${index}: Resolution: ${display.size.width}x${display.size.height}, Work Area: ${display.workArea.width}x${display.workArea.height}, Work Area Size: ${display.workAreaSize.width}x${display.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len
    });
  }

  writeToLogFile(result);
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
    ///TODO Неверно определяет архитектуру
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFile(error.message, LogMessageType.ERROR);
  }
};

const invokeErrorHandler = async (
  title: string,
  error: any,
): Promise<void> => {
  await ipcRenderer.invoke(AppChannel.ERROR_HANDLER_CHANNEL, title, error);
  /* try {
    return;
  } catch (invokeError: any) {
    if (invokeError.message === 'An object could not be cloned.') {
      // 1. If serialization failed, force the passed arg to an error format
      // error = ensureError(error);

      // 2. Then attempt serialization on each property, defaulting to undefined otherwise
      const serialized = serializeError(ensureError(error));
      // 3. Invoke the error handler again with only the serialized error properties
      ipcRenderer.invoke('ERROR_HANDLER_CHANNEL', title, serialized);
    }
  } */
};

let installed = false;

export const unhandled = (): void => {
  if (installed) {
    return;
  }

  installed = true;

  const errorHandler = debounce((error) => {
    invokeErrorHandler('Unhandled Error', error);
  }, DEBOUNCE_DELAY);

  window.addEventListener('error', (event) => {
    event.preventDefault();
    errorHandler(event.error || event);
  });

  const rejectionHandler = debounce((reason) => {
    invokeErrorHandler('Unhandled Promise Rejection', reason);
  }, DEBOUNCE_DELAY);

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    rejectionHandler(event.reason);
  });
};
