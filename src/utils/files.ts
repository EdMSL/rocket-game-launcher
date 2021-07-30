import fs from 'fs';
import { writeToLogFile } from './log';

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла.
 * @returns Строка с данными из файла. Если возникает ошибка, то вернется пустая строка.
*/
export const readFileDataSync = (pathToFile: string, encoding: BufferEncoding = 'utf-8'): string => {
  let data: string;

  try {
    if (fs.existsSync(pathToFile)) {
      data = fs.readFileSync(pathToFile, encoding);
    } else {
      writeToLogFile(`Can't read file ${pathToFile}. File not found.`);

      data = '';
    }
  } catch (error) {
    writeToLogFile(`Can't read file ${pathToFile}.\n${error.message}`);
    
    data = '';
  }

  return data;
};