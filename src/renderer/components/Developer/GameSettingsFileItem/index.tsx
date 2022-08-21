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
  PathVariableName,
} from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { Button } from '$components/UI/Button';
import { getFileNameFromPathToFile } from '$utils/strings';
import {
  getUniqueValidationErrors, IValidationErrors, IValidationError,
} from '$utils/validation';
import { IUserMessage } from '$types/common';

interface IProps {
  file: IGameSettingsFile,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  isModOrganizerUsed: boolean,
  onFileDataChange: (fileName: string, fileData: IGameSettingsFile) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteFile: (id: string) => void,
  addMessage: (message: IUserMessage|string) => void,
}

export const GameSettingsFileItem: React.FC<IProps> = ({
  file,
  pathVariables,
  validationErrors,
  isModOrganizerUsed,
  onFileDataChange,
  onValidation,
  deleteFile,
  addMessage,
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
    validationData: IValidationError[],
    fileName?: string|undefined,
  ) => {
    onFileDataChange(file.id, {
      ...file,
      [fileName!]: value,
    });

    onValidation(getUniqueValidationErrors(
      validationErrors,
      validationData,
    ));
  }, [file, validationErrors, onFileDataChange, onValidation]);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteFile(file.id);
  }, [file.id, deleteFile]);

  const getPathVariablesForSelect = useCallback(() => {
    let variables = [...isModOrganizerUsed
      ? gameSettingsFileAvailableVariablesAll
      : gameSettingsFileAvailableVariablesBase];

    if (pathVariables['%DOCUMENTS%'] === pathVariables['%DOCS_GAME%']) {
      variables = variables.filter(
        (currentVariable) => currentVariable !== PathVariableName.DOCS_GAME,
      );
    }
    return generateSelectOptions(variables);
  }, [pathVariables, isModOrganizerUsed]);

  return (
    <React.Fragment>
      <TextField
        className={styles.file__item}
        id={`label_${file.id}`}
        name="label"
        value={file.label}
        description="Имя файла для идентификации"
        label="Имя"
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
        label="Путь"
        description="Состоит из переменной пути и самого пути к файлу. При выборе пути через диалоговое окно, переменная определяется автоматически." //eslint-disable-line
        selectorType={LauncherButtonAction.RUN}
        selectPathVariables={getPathVariablesForSelect()}
        onChange={onPathSelectorChange}
        onOpenPathError={addMessage}
      />
      <Select
        className={styles.file__item}
        id={`view_${file.id}`}
        name="view"
        label="Структура"
        description='Определяет, какая структура содержимого у файла. Неправильно выбранная структура приведет к ошибке обработки.' //eslint-disable-line
        selectOptions={generateSelectOptions(Object.values(GameSettingsFileView))}
        value={file.view}
        onChange={onSelectChange}
      />
      <TextField
        className={styles.file__item}
        id={`encoding_${file.id}`}
        name="encoding"
        value={file.encoding}
        description="Кодировка файла, которая будет применяться при чтении и сохранении файла. Если не указано, берется значение по умолчанию." //eslint-disable-line max-len
        label="Кодировка"
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

