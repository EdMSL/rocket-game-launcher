import fs from 'fs';

import { writeToLogFile } from './log';
import { parseJSON } from './strings';

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла.
 * @returns Строка с данными из файла. Если возникает ошибка, то вернется пустая строка.
*/
export const readFileDataSync = (
  pathToFile: string,
  encoding: BufferEncoding = 'utf-8',
): string|null => {
  try {
    if (fs.existsSync(pathToFile)) {
      return fs.readFileSync(pathToFile, encoding);
    } else {
      writeToLogFile(`Can't read file ${pathToFile}. File not found.`, true);

      return null;
    }
  } catch (error) {
    writeToLogFile(`Can't read file ${pathToFile}.\n${error.message}`, true);

    return null;
  }
};

export const readJSONFileSync = (pathToFile: string) => {
  const JSONstring = readFileDataSync(pathToFile);

  return parseJSON(JSONstring);
};
