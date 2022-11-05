import {
  app, clipboard, dialog,
} from 'electron';
import cleanStack from 'clean-stack';

import { LogMessageType, writeToLogFileSync } from '$utils/log';

const appName = 'name' in app ? app.name : app.getName();

export const handleUnhandledError = (
  title = `${appName} encountered an error`,
  error,
): void => {
  // error = ensureError(error);//eslint-disable-line

  const stack = cleanStack(error.stack);

  writeToLogFileSync(
    `Message: error.message. Stack: ${stack}`,
    LogMessageType.ERROR,
  );

  if (app.isReady()) {
    const buttons = [
      'OK',
      'Copy error',
    ];

    const buttonIndex = dialog.showMessageBoxSync({
      type: 'error',
      buttons,
      defaultId: 0,
      noLink: true,
      message: title,
      detail: cleanStack(error.stack, { pretty: true }),
    });

    if (buttonIndex === 1) {
      clipboard.writeText(`${title}\n${stack}`);
    }
  } else {
    dialog.showErrorBox(title, 'stack');
  }
};
