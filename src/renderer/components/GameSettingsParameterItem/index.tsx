import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { ISelectOption, IValidationErrors } from '$types/common';
import {
  changeConfigArrayItem,
  generateGameSettingsParameter,
  generateSelectOptions,
  getFullParameter,
  getSelectsOptionStringObj,
  getUniqueValidationErrors,
} from '$utils/data';
import {
  GameSettingControllerType, GameSettingsOptionType, HTMLInputType,
} from '$constants/misc';
import {
  IGameSettingsFile, IGameSettingsGroup, IGameSettingsParameter,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { NumberField } from '$components/UI/NumberField';
import { defaultFullGameSettingsParameter } from '$constants/defaultData';
import { generateSelectOptionsFromString } from '$utils/strings';
import { TextArea } from '$components/UI/TextArea';

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
  onValidation,
  deleteParameter,
}) => {
  const [fullParameter, setFullParameter] = useState<IGameSettingsParameter>(getFullParameter(
    defaultFullGameSettingsParameter,
    parameter,
  ));

  const [optionsValue, setOptionsValue] = useState<{
    [key: string]: string,
  }>(getSelectsOptionStringObj(parameter));

  const parameterFile = useMemo(
    () => gameSettingsFiles.find((currFile) => currFile.name === parameter.file),
    [gameSettingsFiles, parameter.file],
  );

  const onParameterInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>,
  ) => {
    const isParameterItemChange = currentTarget.dataset.parent && currentTarget.dataset.parent !== '';

    let currentParameter: IGameSettingsParameter;

    if (currentTarget.type === HTMLInputType.NUMBER) {
      currentParameter = {
        ...parameter,
        ...isParameterItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: +currentTarget.value },
            parameter.items!,
            false,
          ),
        } : {
          [currentTarget.name]: +currentTarget.value,
        },
      };
    } else if (currentTarget.tagName === 'TEXTAREA') {
      currentParameter = {
        ...parameter,
        ...isParameterItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: generateSelectOptionsFromString(currentTarget.value) },
            parameter.items!,
            false,
          ),
        } : {
          [currentTarget.name]: generateSelectOptionsFromString(currentTarget.value),
        },
      };

      setOptionsValue({
        ...optionsValue,
        [isParameterItemChange ? currentTarget.dataset.parent! : parameter.id]: currentTarget.value,
      });
    } else {
      currentParameter = {
        ...parameter,
        ...isParameterItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: currentTarget.value },
            parameter.items!,
            false,
          ),
        } : {
          [currentTarget.name]: currentTarget.value,
        },
      };
    }

    if (currentTarget.type === 'text' && currentTarget.required) {
      onValidation(getUniqueValidationErrors(
        validationErrors,
        { [currentTarget.id]: ['empty value'] },
        currentTarget.value === '',
      ));
    }

    const { newParameter, newFullParameter } = generateGameSettingsParameter(
      currentParameter,
      fullParameter,
      parameterFile!,
    );

    onParameterDataChange(parameter.id, newParameter);
    setFullParameter(newFullParameter);
  }, [parameter,
    validationErrors,
    optionsValue,
    parameterFile,
    fullParameter,
    onParameterDataChange,
    onValidation]);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteParameter(parameter.id);
  }, [parameter.id, deleteParameter]);

  const gameSettingsFilesOptions = gameSettingsFiles.map((file): ISelectOption => ({ label: file.label, value: file.name }));
  const gameSettingsGroupsOptions = gameSettingsGroups.map((group): ISelectOption => ({ label: group.label, value: group.name }));

  return (
    <React.Fragment>
      <TextField
        className="developer-screen__item"
        id={`label_${parameter.id}`}
        name="label"
        label="Заголовок опции"
        value={parameter.label}
        isRequied
        validationErrors={validationErrors}
        onChange={onParameterInputChange}
      />
      <Select
        className="developer-screen__item"
        id={`optionType_${parameter.id}`}
        options={generateSelectOptions(GameSettingsOptionType)}
        name="optionType"
        label="Тип опции"
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
      <TextField
        className="developer-screen__item"
        id={`description_${parameter.id}`}
        name="description"
        label="Описание опции"
        value={parameter.description}
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
      {
        parameter.name !== undefined && (
          <TextField
            className="developer-screen__item"
            id={`name_${parameter.id}`}
            name="name"
            label="Имя параметра из файла"
            value={parameter.name!}
            isRequied
            validationErrors={validationErrors}
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
            isRequied
            validationErrors={validationErrors}
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
            isRequied
            validationErrors={validationErrors}
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
            isRequied
            validationErrors={validationErrors}
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
            isRequied
            validationErrors={validationErrors}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.controllerType !== undefined && (
          <Select
            className="developer-screen__item"
            id={`controllerType_${parameter.id}`}
            name="controllerType"
            options={generateSelectOptions(parameter.optionType === GameSettingsOptionType.COMBINED
              ? [GameSettingControllerType.SELECT.toUpperCase()]
              : GameSettingControllerType)}
            label="Тип контроллера"
            value={parameter.controllerType}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.options !== undefined && (
          <TextArea
            className="developer-screen__item"
            id={`options_${parameter.id}`}
            name="options"
            label="Опции селектора"
            value={optionsValue[parameter.id]}
            wrap="off"
            placeholder="Видит пользователь=Запишется в файл"
            isRequied
            validationErrors={validationErrors}
            onChange={onParameterInputChange}
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
        parameter.max !== undefined && (
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
        parameter.step !== undefined && (
          <NumberField
            className="developer-screen__item"
            id={`step_${parameter.id}`}
            name="step"
            min={0.001}
            label="Шаг изменения значения"
            value={parameter.step}
            onChange={onParameterInputChange}
          />
        )
      }
      {
        parameter.items !== undefined && (
          <ul>
            {
              parameter.items.map((item) => (
                <li
                  key={item.id}
                  className="developer-screen__item"
                >
                  <TextField
                    id={`name_${item.id}`}
                    parent={item.id}
                    name="name"
                    label="Имя параметра из файла"
                    value={item.name}
                    isRequied
                    validationErrors={validationErrors}
                    onChange={onParameterInputChange}
                  />
                  {
                    item.iniGroup !== undefined && (
                      <TextField
                        id={`iniGroup_${item.id}`}
                        parent={item.id}
                        name="iniGroup"
                        label="Группа параметра из файла"
                        value={item.iniGroup}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onParameterInputChange}
                      />
                    )
                  }
                  {
                    item.valueName !== undefined && (
                      <TextField
                        id={`valueName_${item.id}`}
                        parent={item.id}
                        name="valueName"
                        label="Имя атрибута параметра из файла"
                        value={item.valueName}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onParameterInputChange}
                      />
                    )
                  }
                  {
                    item.valuePath !== undefined && (
                      <TextField
                        id={`valuePath_${item.id}`}
                        parent={item.id}
                        name="valuePath"
                        label="Путь до параметра из файла"
                        value={item.valuePath}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onParameterInputChange}
                      />
                    )
                  }
                  {
                    item.controllerType !== undefined && (
                    <Select
                      id={`controllerType_${item.id}`}
                      parent={item.id}
                      name="controllerType"
                      options={generateSelectOptions(parameter.optionType === GameSettingsOptionType.COMBINED
                        ? [GameSettingControllerType.SELECT.toUpperCase()]
                        : GameSettingControllerType)}
                      label="Тип контроллера"
                      value={item.controllerType}
                      onChange={onParameterInputChange}
                    />
                    )
                  }
                  {
                    item.options !== undefined && (
                    <TextArea
                      id={`options_${item.id}`}
                      parent={item.id}
                      name="options"
                      label="Опции селектора"
                      value={optionsValue[item.id]}
                      wrap="off"
                      placeholder="Видит пользователь=Запишется в файл"
                      isRequied
                      validationErrors={validationErrors}
                      onChange={onParameterInputChange}
                    />
                    )
                  }
                  {
                    item.min !== undefined && (
                    <NumberField
                      id={`min_${item.id}`}
                      parent={item.id}
                      name="min"
                      min=""
                      label="Минимальное значение"
                      value={item.min}
                      onChange={onParameterInputChange}
                    />
                    )
                  }
                  {
                    item.max !== undefined && (
                    <NumberField
                      id={`max_${item.id}`}
                      parent={item.id}
                      name="max"
                      min=""
                      label="Максимальное значение"
                      value={item.max}
                      onChange={onParameterInputChange}
                    />
                    )
                  }
                  {
                    item.step !== undefined && (
                    <NumberField
                      id={`step_${item.id}`}
                      parent={item.id}
                      name="step"
                      min={0.001}
                      label="Шаг изменения значения"
                      value={item.step}
                      onChange={onParameterInputChange}
                    />
                    )
                  }
                </li>
              ))
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
