import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { ISelectOption, IValidationErrors } from '$types/common';
import { generateSelectOptions } from '$utils/data';
import { GameSettingControllerType, GameSettingsOptionType } from '$constants/misc';
import {
  IGameSettingsFile, IGameSettingsGroup, IGameSettingsParameter,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { NumberField } from '$components/UI/NumberField';

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
        value={parameter.file}
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
            value={parameter.settingGroup}
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
      {
        parameter.name && (
          <TextField
            className="developer-screen__item"
            id={`name_${parameter.id}`}
            name="name"
            label="Имя параметра из файла"
            value={parameter.name!}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.iniGroup && (
          <TextField
            className="developer-screen__item"
            id={`iniGroup_${parameter.id}`}
            name="iniGroup"
            label="Группа параметра из файла"
            value={parameter.iniGroup}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.valueName && (
          <TextField
            className="developer-screen__item"
            id={`valueName_${parameter.id}`}
            name="valueName"
            label="Имя атрибута параметра из файла"
            value={parameter.valueName}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.valuePath && (
          <TextField
            className="developer-screen__item"
            id={`valuePath_${parameter.id}`}
            name="valuePath"
            label="Путь до параметра из файла"
            value={parameter.valuePath}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.separator && (
          <TextField
            className="developer-screen__item"
            id={`valuePath_${parameter.id}`}
            name="valuePath"
            label="Разделитель"
            value={parameter.separator}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.controllerType && (
          <Select
            className="developer-screen__item"
            id={`controllerType_${parameter.id}`}
            name="controllerType"
            options={generateSelectOptions(GameSettingControllerType)}
            label="Тип контроллера"
            value={parameter.controllerType}
            onChange={onParameterSelectChange}
          />
        )
      }
      {
        parameter.min !== undefined && (
          <NumberField
            className="developer-screen__item"
            id={`min_${parameter.id}`}
            name="min"
            min=""
            label="Минимальное значение"
            value={parameter.min}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.max && (
          <NumberField
            className="developer-screen__item"
            id={`max_${parameter.id}`}
            name="max"
            min=""
            label="Максимальное значение"
            value={parameter.max}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.step && (
          <NumberField
            className="developer-screen__item"
            id={`step_${parameter.id}`}
            name="step"
            min=""
            label="Шаг изменения значения"
            value={parameter.step}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.items && (
          <ul>
            {
              parameter.items.map((item) => <li>{item.name}</li>)
            }
          </ul>
        )
      }
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
