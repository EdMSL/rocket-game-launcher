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
  getTempFileLabel,
} from '$utils/data';
import {
  UIControllerType, GameSettingsOptionType, availableOptionSeparators,
} from '$constants/misc';
import {
  GameSettingsOptionFields,
  IGameSettingsFile,
  IGameSettingsGroup,
  IGameSettingsOption,
  IGameSettingsOptionItem,
} from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { NumberField } from '$components/UI/NumberField';
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
  const [fullOption, setFullOption] = useState<IGameSettingsOption>(getFullOption(option));
  const [lastAddedItemId, setLastAddedItemId] = useState<string>('');

  const optionFile = useMemo(
    () => getFileByFileName(gameSettingsFiles, option.file),
    [gameSettingsFiles, option.file],
  );

  const onOptionInputChange = useCallback((
    { currentTarget }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>,
  ) => {
    const isOptionItemChange = currentTarget.dataset.parent !== undefined;

    let currentOption: IGameSettingsOption;

    if (currentTarget.tagName === 'TEXTAREA') {
      currentOption = {
        ...option,
        ...isOptionItemChange ? {
          items: changeConfigArrayItem<any>(
            currentTarget.id.split('_')[1],
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
            currentTarget.id.split('_')[1],
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
            currentTarget.id.split('_')[1],
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
    label: getTempFileLabel(file),
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
        id={`${GameSettingsOptionFields.LABEL}_${option.id}`}
        name={GameSettingsOptionFields.LABEL}
        label="Заголовок опции"
        value={option[GameSettingsOptionFields.LABEL]}
        isRequied
        validationErrors={validationErrors}
        onChange={onOptionInputChange}
      />
      <Select
        className={styles.option__item}
        id={`${GameSettingsOptionFields.OPTION_TYPE}_${option.id}`}
        selectOptions={generateSelectOptions(GameSettingsOptionType)}
        name={GameSettingsOptionFields.OPTION_TYPE}
        label="Тип опции"
        value={option[GameSettingsOptionFields.OPTION_TYPE]}
        onChange={onOptionInputChange}
      />
      <Select
        className={styles.option__item}
        id={`${GameSettingsOptionFields.FILE}_${option.id}`}
        selectOptions={selectOptionsFiles}
        name={GameSettingsOptionFields.FILE}
        label="Файл"
        value={option[GameSettingsOptionFields.FILE]}
        onChange={onOptionInputChange}
      />
      <TextField
        className={styles.option__item}
        id={`${GameSettingsOptionFields.DESCRIPTION}_${option.id}`}
        name={GameSettingsOptionFields.DESCRIPTION}
        label="Описание опции"
        value={option[GameSettingsOptionFields.DESCRIPTION]}
        onChange={onOptionInputChange}
      />
      {
        gameSettingsGroups.length !== 0 && (
          <Select
            className={styles.option__item}
            id={`${GameSettingsOptionFields.SETTING_GROUP}_${option.id}`}
            label="Группа настроек"
            selectOptions={selectOptionsGroups}
            name={GameSettingsOptionFields.SETTING_GROUP}
            value={option[GameSettingsOptionFields.SETTING_GROUP]}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.separator !== undefined && (
          <TextField
            className={styles.option__item}
            id={`${GameSettingsOptionFields.SEPARATOR}_${option.id}`}
            name={GameSettingsOptionFields.SEPARATOR}
            label="Разделитель"
            value={option[GameSettingsOptionFields.SEPARATOR]!}
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
            id={`${GameSettingsOptionFields.CONTROLLER_TYPE}_${option.id}`}
            name={GameSettingsOptionFields.CONTROLLER_TYPE}
            selectOptions={generateSelectOptions(
              option.optionType === GameSettingsOptionType.COMBINED
                ? [UIControllerType.SELECT.toUpperCase()]
                : UIControllerType,
            )}
            label="Тип контроллера"
            value={option[GameSettingsOptionFields.CONTROLLER_TYPE]}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.selectOptionsValueString !== undefined && (
          <TextArea
            className={styles.option__item}
            id={`${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${option.id}`}
            name={GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}
            label="Опции селектора"
            value={option[GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING]}
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
            id={`${GameSettingsOptionFields.MIN}_${option.id}`}
            name={GameSettingsOptionFields.MIN}
            min=""
            label="Минимальное значение"
            value={option[GameSettingsOptionFields.MIN]}
            onChange={onOptionInputChange}
            onBlur={onNumberInputBlur}
          />
        )
      }
      {
        option.max !== undefined && (
          <NumberField
            className={styles.option__item}
            id={`${GameSettingsOptionFields.MAX}_${option.id}`}
            name={GameSettingsOptionFields.MAX}
            min=""
            label="Максимальное значение"
            value={option[GameSettingsOptionFields.MAX]}
            onChange={onOptionInputChange}
            onBlur={onNumberInputBlur}
          />
        )
      }
      {
        option.step !== undefined && (
          <NumberField
            className={styles.option__item}
            id={`${GameSettingsOptionFields.STEP}_${option.id}`}
            name={GameSettingsOptionFields.STEP}
            min={0.001}
            label="Шаг изменения значения"
            value={option[GameSettingsOptionFields.STEP]}
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
                  id={`${GameSettingsOptionFields.NAME}_${item.id}_${option.id}`}
                  parent={option.id}
                  name={GameSettingsOptionFields.NAME}
                  label="Имя параметра из файла"
                  value={item[GameSettingsOptionFields.NAME]}
                  isRequied
                  validationErrors={validationErrors}
                  onChange={onOptionInputChange}
                />
                {
                  item.iniGroup !== undefined && (
                  <TextField
                    className={styles.option__item}
                    id={`${GameSettingsOptionFields.INI_GROUP}_${item.id}_${option.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.INI_GROUP}
                    label="Группа параметра из файла"
                    value={item[GameSettingsOptionFields.INI_GROUP]!}
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
                    id={`${GameSettingsOptionFields.VALUE_NAME}_${item.id}_${option.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.VALUE_NAME}
                    label="Имя атрибута параметра из файла"
                    value={item[GameSettingsOptionFields.VALUE_NAME]!}
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
                    id={`${GameSettingsOptionFields.VALUE_PATH}_${item.id}_${option.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.VALUE_PATH}
                    label="Путь до параметра из файла"
                    value={item[GameSettingsOptionFields.VALUE_PATH]!}
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
                      id={`${GameSettingsOptionFields.CONTROLLER_TYPE}_${item.id}_${option.id}`}
                      parent={option.id}
                      name={GameSettingsOptionFields.CONTROLLER_TYPE}
                      selectOptions={generateSelectOptions(
                        option.optionType === GameSettingsOptionType.RELATED
                          ? [UIControllerType.SELECT.toUpperCase()]
                          : UIControllerType,
                      )}
                      label="Тип контроллера"
                      value={item[GameSettingsOptionFields.CONTROLLER_TYPE]}
                      onChange={onOptionInputChange}
                    />
                  )
                }
                {
                  item.selectOptionsValueString !== undefined && (
                    <TextArea
                      className={styles.option__item}
                      id={`${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${item.id}_${option.id}`}
                      parent={option.id}
                      name={GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}
                      label="Опции селектора"
                      value={item[GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING]}
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
                      id={`${GameSettingsOptionFields.MIN}_${item.id}_${option.id}`}
                      parent={option.id}
                      name={GameSettingsOptionFields.MIN}
                      min=""
                      label="Минимальное значение"
                      value={item[GameSettingsOptionFields.MIN]}
                      onChange={onOptionInputChange}
                      onBlur={onNumberInputBlur}
                    />
                  )
                }
                {
                  item.max !== undefined && (
                    <NumberField
                      className={styles.option__item}
                      id={`${GameSettingsOptionFields.MAX}_${item.id}_${option.id}`}
                      parent={option.id}
                      name={GameSettingsOptionFields.MAX}
                      min=""
                      label="Максимальное значение"
                      value={item[GameSettingsOptionFields.MAX]}
                      onChange={onOptionInputChange}
                      onBlur={onNumberInputBlur}
                    />
                  )
                }
                {
                  item.step !== undefined && (
                    <NumberField
                      className={styles.option__item}
                      id={`${GameSettingsOptionFields.STEP}_${item.id}_${option.id}`}
                      parent={option.id}
                      name={GameSettingsOptionFields.STEP}
                      min={0.001}
                      label="Шаг изменения значения"
                      value={item[GameSettingsOptionFields.STEP]}
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
