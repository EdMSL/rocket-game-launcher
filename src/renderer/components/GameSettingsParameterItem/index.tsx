import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { ISelectOption, IValidationErrors } from '$types/common';
import { generateSelectOptions } from '$utils/data';
import { GameSettingsOptionType } from '$constants/misc';
import {
  IGameSettingsFile, IGameSettingsGroup, IGameSettingsParameter,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';

interface IProps {
  parameter: IGameSettingsParameter,
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsGroups: IGameSettingsGroup[],
  validationErrors: IValidationErrors,
  onParameterDataChange: (id: string, data: IGameSettingsParameter) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteParameter: (id: string) => void,
}

export const GameSettingsParameterItem: React.FC<IProps> = ({
  parameter,
  gameSettingsFiles,
  gameSettingsGroups,
  validationErrors,
  onParameterDataChange,
  deleteParameter,
}) => {
  const onOptionTypeChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onParameterDataChange(
      parameter.id,
      { ...parameter, optionType: GameSettingsOptionType[currentTarget.value.toUpperCase()] },
    );
  }, [parameter, onParameterDataChange]);

  const onParameterSelectChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onParameterDataChange(parameter.id, {
      ...parameter,
      [currentTarget.name]: currentTarget.value,
    });
  }, [parameter, onParameterDataChange]);

  const onParameterInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onParameterDataChange(parameter.id, {
      ...parameter,
      [currentTarget.name]: currentTarget.value,
    });
  }, [parameter, onParameterDataChange]);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteParameter(parameter.id);
  }, [parameter.id, deleteParameter]);

  const gameSettingsFilesOptions = gameSettingsFiles.map((file): ISelectOption => ({ label: file.label, value: file.name }));
  const gameSettingsGroupsOptions = gameSettingsGroups.map((group): ISelectOption => ({ label: group.label, value: group.name }));

  return (
    <React.Fragment>
      <Select
        className="developer-screen__item"
        id={`optionType_${parameter.id}`}
        options={generateSelectOptions(GameSettingsOptionType)}
        label="Тип параметра"
        value={parameter.optionType}
        onChange={onOptionTypeChange}
      />
      <Select
        className="developer-screen__item"
        id={`file_${parameter.id}`}
        options={gameSettingsFilesOptions}
        name="file"
        label="Файл"
        onChange={onParameterSelectChange}
      />
      {
        gameSettingsGroups.length !== 0 && (
          <Select
            className="developer-screen__item"
            id={`settingGroup_${parameter.id}`}
            label="Группа настроек"
            options={gameSettingsGroupsOptions}
            name="settingGroup"
            onChange={onParameterSelectChange}
          />
        )
      }
      <TextField
        className="developer-screen__item"
        id={`label_${parameter.id}`}
        name="label"
        label="Заголовок параметра"
        value={parameter.label}
        onChange={onParameterInputChange}
      />
      <TextField
        className="developer-screen__item"
        id={`description_${parameter.id}`}
        name="description"
        label="Описание параметра"
        value={parameter.description}
        onChange={onParameterInputChange}
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
    </React.Fragment>
  );
};
