import React, {
  useCallback, useMemo, useState,
} from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { ISelectOption, IValidationErrors } from '$types/common';
import {
  generateGameSettingsParameter, generateSelectOptions,
} from '$utils/data';
import { GameSettingControllerType, GameSettingsOptionType } from '$constants/misc';
import {
  IGameSettingsFile, IGameSettingsGroup, IGameSettingsParameter,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { NumberField } from '$components/UI/NumberField';
import { defaultFullGameSettingsParameter } from '$constants/defaultData';

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
  const [fullParameter, setFullParameter] = useState<IGameSettingsParameter>({
    ...defaultFullGameSettingsParameter,
    ...parameter,
  });

  const file = useMemo(
    () => gameSettingsFiles.find((currFile) => currFile.name === parameter.file),
    [gameSettingsFiles, parameter.file],
  );

  const onParameterInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>,
  ) => {
    const { newParameter, newFullParameter } = generateGameSettingsParameter({
      ...parameter,
      [currentTarget.name]: currentTarget.value,
    },
    fullParameter,
    file!);

    onParameterDataChange(parameter.id, newParameter);
    setFullParameter(newFullParameter);
  }, [parameter, file, fullParameter, onParameterDataChange]);

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
        name="optionType"
        label="Тип параметра"
        value={parameter.optionType}
        onChange={onParameterInputChange}
      />
      <Select
        className="developer-screen__item"
        id={`file_${parameter.id}`}
        options={gameSettingsFilesOptions}
        name="file"
        label="Файл"
        value={parameter.file}
        onChange={onParameterInputChange}
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
            onChange={onParameterInputChange}
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
        parameter.name !== undefined && (
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
        parameter.iniGroup !== undefined && (
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
        parameter.valueName !== undefined && (
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
        parameter.valuePath !== undefined && (
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
        parameter.separator !== undefined && (
          <TextField
            className="developer-screen__item"
            id={`separator_${parameter.id}`}
            name="separator"
            label="Разделитель"
            value={parameter.separator}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.controllerType && parameter.optionType !== GameSettingsOptionType.COMBINED && (
          <Select
            className="developer-screen__item"
            id={`controllerType_${parameter.id}`}
            name="controllerType"
            options={generateSelectOptions(GameSettingControllerType)}
            label="Тип контроллера"
            value={parameter.controllerType}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.options && (
          <ul>
            {
              Object.keys(parameter.options).map((key) => (
                <li key={`${parameter.id}_${key}`}>
                  <span>{key}</span>
                  <span>{parameter.options![key]}</span>
                </li>
              ))
            }
          </ul>
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
              parameter.items.map((item) => <li key={item.id}>{item.name}</li>)
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
