import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IGameSettingsFile } from '$types/gameSettings';
import { TextField } from '$components/UI/TextField';
import { Select } from '$components/UI/Select';
import { generateSelectOptions, getUniqueValidationErrors } from '$utils/data';
import {
  gameSettingsFileAvailableVariables, GameSettingsFileView, LauncherButtonAction,
} from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { IValidationData } from '$utils/check';
import { IValidationErrors } from '$types/common';
import { Button } from '$components/UI/Button';

interface IProps {
  file: IGameSettingsFile,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  onFileDataChange: (fileName: string, fileData: IGameSettingsFile) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteFile: (fileName: string) => void,
}

export const GameSettingsFileItem: React.FC<IProps> = ({
  file,
  pathVariables,
  validationErrors,
  onFileDataChange,
  onValidation,
  deleteFile,
}) => {
  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFileDataChange(file.name, {
      ...file,
      [target.name]: target.value,
    });
  }, [file, onFileDataChange]);

  const onSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFileDataChange(file.name, {
      ...file,
      [target.name]: target.value,
    });
  }, [file, onFileDataChange]);

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
    fileName?: string|undefined,
  ) => {
    onFileDataChange(file.name, {
      ...file,
      [fileName!]: value,
    });

    onValidation(getUniqueValidationErrors(
      validationErrors,
      validationData.errors,
      validationData.isForAdd,
    ));
  }, [file, validationErrors, onFileDataChange, onValidation]);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteFile(file.name);
  }, [file.name, deleteFile]);

  return (
    <li className={classNames(
      'developer-screen__spoiler-item',
      styles['game-settings-file__item'],
    )}
    >
      <details className="developer-screen__spoiler-block">
        <summary
          className={classNames(
            'developer-screen__spoiler-title',
            Object.keys(validationErrors).find((error) => error.includes(file.name))
            && 'developer-screen__spoiler-title--error',
          )}
        >
          <span className="developer-screen__spoiler-text">Имя файла:</span>
          <span className="developer-screen__spoiler-text">{file.name}</span>
          <span className="developer-screen__spoiler-text">Путь:</span>
          <span className="developer-screen__spoiler-text">{file.path}</span>
          <span className="developer-screen__spoiler-text">Тип:</span>
          <span className="developer-screen__spoiler-text">{file.view}</span>
          <Button
            className={classNames(
              'developer-screen__spoiler-title-btn',
              'developer-screen__spoiler-title-btn--delete',
            )}
            onClick={onDeleteFileBtnClick}
          >
            Удалить
          </Button>
        </summary>
        <PathSelector
          className="developer-screen__item"
          id={`file-path_${file.name}`}
          parent="path"
          pathVariables={pathVariables}
          validationErrors={validationErrors[`file-path_${file.name}`]}
          value={file.path}
          label="Путь до файла настроек"
          description="Состоит из переменной пути и самого пути к файлу. При выборе пути через диалоговое окно, переменная определяется автоматически." //eslint-disable-line
          selectorType={LauncherButtonAction.RUN}
          options={generateSelectOptions(gameSettingsFileAvailableVariables)}
          onChange={onPathSelectorChange}
        />
        <Select
          className="developer-screen__item"
          id={`game-settings-file-view_${file.name}`}
          name="view"
          label="Тип структуры файла"
          description='Определяет, какая структура содержимого у файла. Неправильно выбранная структура приведет к ошибке обработки.' //eslint-disable-line
          optionsArr={generateSelectOptions(GameSettingsFileView, true)}
          value={file.view}
          onChange={onSelectChange}
        />
        <TextField
          className="developer-screen__item"
          id={`game-settings-file-name_${file.name}`}
          name="name"
          value={file.name}
          description="Имя файла для идентификации"
          label="Имя файла"
          onChange={onTextFieldChange}
        />
        <TextField
          className="developer-screen__item"
          id={`game-settings-file-encoding_${file.name}`}
          name="encoding"
          value={file.encoding}
          description="Кодировка файла, которая будет применяться при чтении и сохранении файла. Если не указано, берется значение по умолчанию." //eslint-disable-line max-len
          label="Кодировка файла"
          onChange={onTextFieldChange}
        />
        <Button
          className={classNames(
            'main-btn',
            'developer-screen__spoiler-button',
          )}
          onClick={onDeleteFileBtnClick}
        >
          Удалить
        </Button>
      </details>
    </li>
  );
};

