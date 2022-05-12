import React, {
  useCallback, useMemo, useState,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Select } from '$components/UI/Select';
import { ISelectOption, IValidationErrors } from '$types/common';
import {
  changeConfigArrayItem,
  generateGameSettingsOption,
  generateSelectOptions,
  getFileByFileName,
  getFullOption,
  getSelectsOptionStringObj,
} from '$utils/data';
import {
  UIControllerType, GameSettingsOptionType, HTMLInputType,
} from '$constants/misc';
import {
  IGameSettingsFile, IGameSettingsGroup, IGameSettingsOption, IGameSettingsOptionItem,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { NumberField } from '$components/UI/NumberField';
import { defaultFullGameSettingsOption } from '$constants/defaultData';
import { generateSelectOptionsFromString, getRandomId } from '$utils/strings';
import { TextArea } from '$components/UI/TextArea';
import { SpoilerListItem } from '$components/Developer/SpoilerListItem';
import { setOptionStartValidationErrors, validateOptionFields } from '$utils/validation';

interface IProps {
  option: IGameSettingsOption,
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsGroups: IGameSettingsGroup[],
  validationErrors: IValidationErrors,
  onOptionDataChange: (id: string, data: IGameSettingsOption) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteOption: (id: string) => void,
}

export const GameSettingsOptionItem: React.FC<IProps> = ({
  option,
  gameSettingsFiles,
  gameSettingsGroups,
  validationErrors,
  onOptionDataChange,
  onValidation,
  deleteOption,
}) => {
  const [fullOption, setFullOption] = useState<IGameSettingsOption>(getFullOption(
    defaultFullGameSettingsOption,
    option,
  ));
  const [optionsValue, setOptionsValue] = useState<{
    [key: string]: string,
  }>(getSelectsOptionStringObj(option));
  const [lastAddedItemId, setLastAddedItemId] = useState<string>('');

  const optionFile = useMemo(
    () => getFileByFileName(gameSettingsFiles, option.file),
    [gameSettingsFiles, option.file],
  );

  const onOptionInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>,
  ) => {
    const isOptionItemChange = currentTarget.dataset.parent && currentTarget.dataset.parent !== '';

    let currentOption: IGameSettingsOption;

    if (currentTarget.type === HTMLInputType.NUMBER) {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: +currentTarget.value },
            option.items!,
            false,
          ),
        } : {
          [currentTarget.name]: +currentTarget.value,
        },
      };
    } else if (currentTarget.tagName === 'TEXTAREA') {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: generateSelectOptionsFromString(currentTarget.value) },
            option.items!,
            false,
          ),
        } : {
          [currentTarget.name]: generateSelectOptionsFromString(currentTarget.value),
        },
      };

      setOptionsValue({
        ...optionsValue,
        [isOptionItemChange ? currentTarget.dataset.parent! : option.id]: currentTarget.value,
      });
    } else {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: currentTarget.value },
            option.items!,
            false,
          ),
        } : {
          [currentTarget.name]: currentTarget.value,
        },
      };
    }

    const { newOption, newFullOption } = generateGameSettingsOption(
      currentOption,
      fullOption,
      currentTarget.name === 'file'
        ? getFileByFileName(gameSettingsFiles, currentTarget.value)!
        : optionFile!,
    );

    if (currentTarget.name === 'file') {
      onValidation(setOptionStartValidationErrors(
        newOption,
        getFileByFileName(gameSettingsFiles, newOption.file)!,
        validationErrors,
      ));
    } else {
      onValidation(validateOptionFields(currentTarget, newOption, validationErrors));
    }

    onOptionDataChange(option.id, newOption);
    setFullOption(newFullOption);
  }, [option,
    validationErrors,
    optionsValue,
    optionFile,
    fullOption,
    gameSettingsFiles,
    onOptionDataChange,
    onValidation]);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteOption(option.id);
  }, [option.id, deleteOption]);

  const onAddOptionItemBtnClick = useCallback(() => {
    const newId = getRandomId();
    const { newOption, newFullOption } = generateGameSettingsOption(
      {
        ...option,
        items: [...option.items!, {
          ...option.items![option.items!.length - 1],
          id: newId,
        }],
      },
      fullOption,
      optionFile!,
    );

    onOptionDataChange(option.id, newOption);
    setFullOption(newFullOption);
    setLastAddedItemId(newId);
  }, [option, fullOption, optionFile, onOptionDataChange]);

  const selectOptionsFiles = gameSettingsFiles.map((file): ISelectOption => ({
    label: file.label,
    value: file.name,
  }));
  const selectOptionsGroups = gameSettingsGroups.map((group): ISelectOption => ({
    label: group.label,
    value: group.name,
  }));

  return (
    <React.Fragment>
      <TextField
        className={styles.option__item}
        id={`label_${option.id}`}
        name="label"
        label="Заголовок опции"
        value={option.label}
        isRequied
        validationErrors={validationErrors}
        onChange={onOptionInputChange}
      />
      <Select
        className={styles.option__item}
        id={`optionType_${option.id}`}
        selectOptions={generateSelectOptions(GameSettingsOptionType)}
        name="optionType"
        label="Тип опции"
        value={option.optionType}
        onChange={onOptionInputChange}
      />
      <Select
        className={styles.option__item}
        id={`file_${option.id}`}
        selectOptions={selectOptionsFiles}
        name="file"
        label="Файл"
        value={option.file}
        onChange={onOptionInputChange}
      />
      <TextField
        className={styles.option__item}
        id={`description_${option.id}`}
        name="description"
        label="Описание опции"
        value={option.description}
        onChange={onOptionInputChange}
      />
      {
        gameSettingsGroups.length !== 0 && (
          <Select
            className={styles.option__item}
            id={`settingGroup_${option.id}`}
            label="Группа настроек"
            selectOptions={selectOptionsGroups}
            name="settingGroup"
            value={option.settingGroup}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.name !== undefined && (
          <TextField
            className={styles.option__item}
            id={`name_${option.id}`}
            name="name"
            label="Имя параметра из файла"
            value={option.name!}
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.iniGroup !== undefined && (
          <TextField
            className={styles.option__item}
            id={`iniGroup_${option.id}`}
            name="iniGroup"
            label="Группа параметра из файла"
            value={option.iniGroup}
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.valueName !== undefined && (
          <TextField
            className={styles.option__item}
            id={`valueName_${option.id}`}
            name="valueName"
            label="Имя атрибута параметра из файла"
            value={option.valueName}
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.valuePath !== undefined && (
          <TextField
            className={styles.option__item}
            id={`valuePath_${option.id}`}
            name="valuePath"
            label="Путь до параметра из файла"
            value={option.valuePath}
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.separator !== undefined && (
          <TextField
            className={styles.option__item}
            id={`separator_${option.id}`}
            name="separator"
            label="Разделитель"
            value={option.separator}
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.controllerType !== undefined && (
          <Select
            className={styles.option__item}
            id={`controllerType_${option.id}`}
            name="controllerType"
            selectOptions={generateSelectOptions(option.optionType === GameSettingsOptionType.COMBINED
              ? [UIControllerType.SELECT.toUpperCase()]
              : UIControllerType)}
            label="Тип контроллера"
            value={option.controllerType}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.selectOptions !== undefined && (
          <TextArea
            className={styles.option__item}
            id={`options_${option.id}`}
            name="options"
            label="Опции селектора"
            value={optionsValue[option.id]}
            wrap="off"
            placeholder="Видит пользователь=Запишется в файл"
            isRequied
            validationErrors={validationErrors}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.min !== undefined && (
          <NumberField
            className={styles.option__item}
            id={`min_${option.id}`}
            name="min"
            min=""
            label="Минимальное значение"
            value={option.min}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.max !== undefined && (
          <NumberField
            className={styles.option__item}
            id={`max_${option.id}`}
            name="max"
            min=""
            label="Максимальное значение"
            value={option.max}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.step !== undefined && (
          <NumberField
            className={styles.option__item}
            id={`step_${option.id}`}
            name="step"
            min={0.001}
            label="Шаг изменения значения"
            value={option.step}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.items !== undefined && (
          <React.Fragment>
            <p className={styles.option__items}>Список параметров из файла для опции</p>
            <ul className={styles.option__list}>
              {
              option.items.map((item) => (
                <SpoilerListItem<IGameSettingsOptionItem>
                  key={item.id}
                  item={item}
                  items={option.items!}
                  summaryText={[item.name]}
                  lastItemId={lastAddedItemId}
                >
                  <React.Fragment>
                    <TextField
                      className={styles.option__item}
                      id={`name_${item.id}`}
                      parent={item.id}
                      name="name"
                      label="Имя параметра из файла"
                      value={item.name}
                      isRequied
                      validationErrors={validationErrors}
                      onChange={onOptionInputChange}
                    />
                    {
                    item.iniGroup !== undefined && (
                      <TextField
                        className={styles.option__item}
                        id={`iniGroup_${item.id}`}
                        parent={item.id}
                        name="iniGroup"
                        label="Группа параметра из файла"
                        value={item.iniGroup}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onOptionInputChange}
                      />
                    )
                    }
                    {
                    item.valueName !== undefined && (
                      <TextField
                        className={styles.option__item}
                        id={`valueName_${item.id}`}
                        parent={item.id}
                        name="valueName"
                        label="Имя атрибута параметра из файла"
                        value={item.valueName}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onOptionInputChange}
                      />
                    )
                    }
                    {
                    item.valuePath !== undefined && (
                      <TextField
                        className={styles.option__item}
                        id={`valuePath_${item.id}`}
                        parent={item.id}
                        name="valuePath"
                        label="Путь до параметра из файла"
                        value={item.valuePath}
                        isRequied
                        validationErrors={validationErrors}
                        onChange={onOptionInputChange}
                      />
                    )
                    }
                    {
                    item.controllerType !== undefined && (
                    <Select
                      className={styles.option__item}
                      id={`controllerType_${item.id}`}
                      parent={item.id}
                      name="controllerType"
                      selectOptions={generateSelectOptions(option.optionType === GameSettingsOptionType.RELATED
                        ? [UIControllerType.SELECT.toUpperCase()]
                        : UIControllerType)}
                      label="Тип контроллера"
                      value={item.controllerType}
                      onChange={onOptionInputChange}
                    />
                    )
                    }
                    {
                    item.selectOptions !== undefined && (
                    <TextArea
                      className={styles.option__item}
                      id={`options_${item.id}`}
                      parent={item.id}
                      name="options"
                      label="Опции селектора"
                      value={optionsValue[item.id]}
                      wrap="off"
                      placeholder="Видит пользователь=Запишется в файл"
                      isRequied
                      validationErrors={validationErrors}
                      onChange={onOptionInputChange}
                    />
                    )
                    }
                    {
                    item.min !== undefined && (
                    <NumberField
                      className={styles.option__item}
                      id={`min_${item.id}`}
                      parent={item.id}
                      name="min"
                      min=""
                      label="Минимальное значение"
                      value={item.min}
                      onChange={onOptionInputChange}
                    />
                    )
                    }
                    {
                    item.max !== undefined && (
                    <NumberField
                      className={styles.option__item}
                      id={`max_${item.id}`}
                      parent={item.id}
                      name="max"
                      min=""
                      label="Максимальное значение"
                      value={item.max}
                      onChange={onOptionInputChange}
                    />
                    )
                    }
                    {
                    item.step !== undefined && (
                    <NumberField
                      className={styles.option__item}
                      id={`step_${item.id}`}
                      parent={item.id}
                      name="step"
                      min={0.001}
                      label="Шаг изменения значения"
                      value={item.step}
                      onChange={onOptionInputChange}
                    />
                    )
                    }
                  </React.Fragment>
                </SpoilerListItem>
              ))
            }
            </ul>
            {
              option.optionType !== GameSettingsOptionType.DEFAULT && (
              <Button
                className={classNames(
                  'main-btn',
                  'option__btn',
                )}
                onClick={onAddOptionItemBtnClick}
              >
                Добавить параметр
              </Button>
              )
            }
          </React.Fragment>
        )
      }
      <Button
        className={classNames(
          'main-btn',
          'option__btn',
        )}
        onClick={onDeleteFileBtnClick}
      >
        Удалить опцию
      </Button>
    </React.Fragment>
  );
};
