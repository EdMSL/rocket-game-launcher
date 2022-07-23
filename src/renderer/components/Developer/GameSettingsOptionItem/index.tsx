import React, {
  useCallback, useMemo, useState,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Select } from '$components/UI/Select';
import { ISelectOption } from '$types/common';
import {
  changeConfigArrayItem,
  generateGameSettingsOption,
  generateSelectOptions,
  getFileByFileName,
  getFullOption,
} from '$utils/data';
import {
  UIControllerType, GameSettingsOptionType, HTMLInputType, availableOptionSeparators,
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
import {
  clearComponentValidationErrors,
  IValidationErrors,
  validateControllerTypeRelatedFields,
  validateGameSettingsOptions,
} from '$utils/validation';

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
  const [lastAddedItemId, setLastAddedItemId] = useState<string>('');

  const optionFile = useMemo(
    () => getFileByFileName(gameSettingsFiles, option.file),
    [gameSettingsFiles, option.file],
  );

  const onOptionInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>,
  ) => {
    const isOptionItemChange = currentTarget.dataset.parent !== undefined
    && currentTarget.dataset.parent !== '';

    let currentOption: IGameSettingsOption;

    if (currentTarget.tagName === 'TEXTAREA') {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            {
              [currentTarget.name]: currentTarget.value,
              selectOptions: generateSelectOptionsFromString(currentTarget.value),
            },
            option.items,
            false,
          ),
        } : {
          [currentTarget.name]: currentTarget.value,
          selectOptions: generateSelectOptionsFromString(currentTarget.value),
        },
      };
    } else {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: currentTarget.value },
            option.items,
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

    onValidation(validateGameSettingsOptions(
      currentTarget,
      newOption,
      getFileByFileName(gameSettingsFiles, newOption.file)!,
      validationErrors,
    ));

    onOptionDataChange(option.id, newOption);
    setFullOption(newFullOption);
  }, [option,
    validationErrors,
    optionFile,
    fullOption,
    gameSettingsFiles,
    onOptionDataChange,
    onValidation]);

  const onNumberInputBlur = useCallback(({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    const isOptionItemChange = currentTarget.dataset.parent !== undefined
    && currentTarget.dataset.parent !== '';
    let currentValue = +currentTarget.value;

    if (+currentTarget.min && currentValue <= +currentTarget.min) {
      currentValue = +currentTarget.min;
    }

    const { newOption, newFullOption } = generateGameSettingsOption(
      {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.dataset.parent!,
            { [currentTarget.name]: currentValue },
            option.items,
            false,
          ),
        } : {
          [currentTarget.name]: currentValue,
        },
      },
      fullOption,
      optionFile!,
    );

    onOptionDataChange(option.id, newOption);
    setFullOption(newFullOption);
  }, [option,
    optionFile,
    fullOption,
    onOptionDataChange]);

  const onDeleteOptionBtnClick = useCallback(() => {
    deleteOption(option.id);
    onValidation(clearComponentValidationErrors(validationErrors, option.id));
  }, [option.id, validationErrors, onValidation, deleteOption]);

  const onAddOptionItemBtnClick = useCallback(() => {
    const newId = getRandomId();
    const { newOption, newFullOption } = generateGameSettingsOption(
      {
        ...option,
        items: [
          {
            ...option.items[option.items.length - 1],
            id: newId,
          },
          ...option.items],
      },
      fullOption,
      optionFile!,
    );

    if (option.optionType === GameSettingsOptionType.COMBINED) {
      onValidation(validateControllerTypeRelatedFields(
        newOption,
        validationErrors,
      ));
    }

    onOptionDataChange(option.id, newOption);
    setFullOption(newFullOption);
    setLastAddedItemId(newId);
  }, [option, fullOption, optionFile, validationErrors, onValidation, onOptionDataChange]);

  const deleteOptionItem = useCallback((
    newItems: IGameSettingsOptionItem[],
  ) => {
    const newOption = { ...option, items: newItems };

    if (option.optionType === GameSettingsOptionType.COMBINED) {
      onValidation(validateControllerTypeRelatedFields(
        newOption,
        validationErrors,
      ));
    }

    onOptionDataChange(option.id, newOption);
    setFullOption({ ...fullOption, items: newItems });
  }, [option, fullOption, validationErrors, onValidation, onOptionDataChange]);

  const onDeleteOptionItemBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    deleteOptionItem(option.items.filter((item) => item.id !== currentTarget.id.split(':')[1]));
  }, [option.items, deleteOptionItem]);

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
        option.separator !== undefined && (
          <TextField
            className={styles.option__item}
            id={`separator_${option.id}`}
            name="separator"
            label="Разделитель"
            value={option.separator}
            placeholder={availableOptionSeparators.join()}
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
            selectOptions={generateSelectOptions(
              option.optionType === GameSettingsOptionType.COMBINED
                ? [UIControllerType.SELECT.toUpperCase()]
                : UIControllerType,
            )}
            label="Тип контроллера"
            value={option.controllerType}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.selectOptionsValueString !== undefined && (
          <TextArea
            className={styles.option__item}
            id={`selectOptionsValueString_${option.id}`}
            name="selectOptionsValueString"
            label="Опции селектора"
            value={option.selectOptionsValueString}
            wrap="off"
            placeholder={option.optionType === GameSettingsOptionType.COMBINED
              ? `Видит пользователь=Значение первого параметра${option.separator}Значение второго параметра(и т.д.)`//eslint-disable-line max-len
              : 'Видит пользователь=Значение параметра'}
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
            onBlur={onNumberInputBlur}
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
            onBlur={onNumberInputBlur}
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
            onBlur={onNumberInputBlur}
          />
        )
      }
      <p className={styles.option__items}>Параметры из файла</p>
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
      <ul className={styles.option__list}>
        {
          option.items.map((item) => (
            <SpoilerListItem<IGameSettingsOptionItem>
              key={item.id}
              item={item}
              items={option.items}
              summaryText={[item.name]}
              lastItemId={lastAddedItemId}
              validationErrors={validationErrors}
              isDeleteBtnDisabled={option.items.length <= 2}
              onDeleteItem={option.optionType !== GameSettingsOptionType.DEFAULT
                ? deleteOptionItem
                : undefined}
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
                      selectOptions={generateSelectOptions(
                        option.optionType === GameSettingsOptionType.RELATED
                          ? [UIControllerType.SELECT.toUpperCase()]
                          : UIControllerType,
                      )}
                      label="Тип контроллера"
                      value={item.controllerType}
                      onChange={onOptionInputChange}
                    />
                  )
                }
                {
                  item.selectOptionsValueString !== undefined && (
                    <TextArea
                      className={styles.option__item}
                      id={`selectOptionsValueString_${item.id}`}
                      parent={item.id}
                      name="selectOptionsValueString"
                      label="Опции селектора"
                      value={item.selectOptionsValueString}
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
                      onBlur={onNumberInputBlur}
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
                      onBlur={onNumberInputBlur}
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
                      onBlur={onNumberInputBlur}
                    />
                  )
                }
                {
                  option.optionType !== GameSettingsOptionType.DEFAULT && (
                  <Button
                    className={classNames('main-btn', 'option__btn')}
                    id={`delete:${item.id}`}
                    name={option.items.length.toString()}
                    isDisabled={option.items.length <= 2}
                    onClick={onDeleteOptionItemBtnClick}
                  >
                    Удалить параметр
                  </Button>
                  )
                }
              </React.Fragment>
            </SpoilerListItem>
          ))
            }
      </ul>
      <Button
        className={classNames(
          'main-btn',
          'option__btn',
        )}
        onClick={onDeleteOptionBtnClick}
      >
        Удалить опцию
      </Button>
    </React.Fragment>
  );
};
