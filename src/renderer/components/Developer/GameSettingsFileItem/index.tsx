import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IGameSettingsFile } from '$types/gameSettings';
import { TextField } from '$components/UI/TextField';
import { Select } from '$components/UI/Select';
import { generateSelectOptions } from '$utils/data';
import {
  gameSettingsFileAvailableVariablesAll,
  gameSettingsFileAvailableVariablesBase,
  GameSettingsFileView,
  LauncherButtonAction,
} from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { Button } from '$components/UI/Button';
import { getFileNameFromPathToFile } from '$utils/strings';
import {
  getUniqueValidationErrors, IValidationErrors, IValidationData,
} from '$utils/validation';

interface IProps {
  file: IGameSettingsFile,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  isModOrganizerUsed: boolean,
  onFileDataChange: (fileName: string, fileData: IGameSettingsFile) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteFile: (id: string) => void,
}

export const GameSettingsFileItem: React.FC<IProps> = ({
  file,
  pathVariables,
  validationErrors,
  isModOrganizerUsed,
  onFileDataChange,
  onValidation,
  deleteFile,
}) => {
  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFileDataChange(file.id, {
      ...file,
      [target.name]: target.value,
    });
  }, [file, onFileDataChange]);

  const onSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFileDataChange(file.id, {
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
    onFileDataChange(file.id, {
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
    deleteFile(file.id);
  }, [file.id, deleteFile]);

  return (
    <React.Fragment>
      <TextField
        className={styles.file__item}
        id={`label_${file.id}`}
        name="label"
        value={file.label}
        description="Имя файла для идентификации"
        label="Имя файла"
        placeholder={getFileNameFromPathToFile(file.path)}
        onChange={onTextFieldChange}
      />
      <PathSelector
        className={styles.file__item}
        id={`file-path_${file.id}`}
        parent="path"
        pathVariables={pathVariables}
        validationErrors={validationErrors}
        value={file.path}
        label="Путь до файла настроек"
        description="Состоит из переменной пути и самого пути к файлу. При выборе пути через диалоговое окно, переменная определяется автоматически." //eslint-disable-line
        selectorType={LauncherButtonAction.RUN}
        selectPathVariables={generateSelectOptions(isModOrganizerUsed
          ? gameSettingsFileAvailableVariablesAll
          : gameSettingsFileAvailableVariablesBase)}
        onChange={onPathSelectorChange}
      />
      <Select
        className={styles.file__item}
        id={`view_${file.id}`}
        name="view"
        label="Тип структуры файла"
        description='Определяет, какая структура содержимого у файла. Неправильно выбранная структура приведет к ошибке обработки.' //eslint-disable-line
        selectOptions={generateSelectOptions(GameSettingsFileView)}
        value={file.view}
        onChange={onSelectChange}
      />
      <TextField
        className={styles.file__item}
        id={`encoding_${file.id}`}
        name="encoding"
        value={file.encoding}
        description="Кодировка файла, которая будет применяться при чтении и сохранении файла. Если не указано, берется значение по умолчанию." //eslint-disable-line max-len
        label="Кодировка файла"
        onChange={onTextFieldChange}
      />
      <Button
        className={classNames(
          'main-btn',
          'file__btn',
        )}
        onClick={onDeleteFileBtnClick}
      >
        Удалить
      </Button>
    </React.Fragment>
  );
};

