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
import {
  gatGameSettingOptionItemId, generateSelectOptionsFromString, getRandomId,
} from '$utils/strings';
import { TextArea } from '$components/UI/TextArea';
import { SpoilerListItem } from '$components/Developer/SpoilerListItem';
import {
  clearIDRelatedValidationErrors,
  IValidationErrors,
  validateControllerTypeRelatedFields,
  validateOptionTypeRelatedFields,
  validateTargetGameSettingsOption,
} from '$utils/validation';
import { defaultGameSettingsOptionItem } from '$constants/defaultData';

interface IProps {
  option: IGameSettingsOption,
  fullOption: IGameSettingsOption,
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsGroups: IGameSettingsGroup[],
  validationErrors: IValidationErrors,
  onOptionDataChange: (id: string, data: IGameSettingsOption, full: IGameSettingsOption) => void,
  onValidation: (errors: IValidationErrors) => void,
  deleteOption: (id: string) => void,
}

export const GameSettingsOptionItem: React.FC<IProps> = ({
  option,
  fullOption,
  gameSettingsFiles,
  gameSettingsGroups,
  validationErrors,
  onOptionDataChange,
  onValidation,
  deleteOption,
}) => {
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
            gatGameSettingOptionItemId(currentTarget.id),
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
            gatGameSettingOptionItemId(currentTarget.id),
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
      currentTarget.name === 'file'
        ? getFileByFileName(gameSettingsFiles, currentTarget.value)!
        : optionFile!,
      fullOption,
    );

    onValidation(validateTargetGameSettingsOption(
      currentTarget,
      newOption,
      getFileByFileName(gameSettingsFiles, newOption.file)!,
      validationErrors,
    ));

    onOptionDataChange(option.id, newOption, newFullOption);
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
            gatGameSettingOptionItemId(currentTarget.id),
            { [currentTarget.name]: currentValue },
            option.items,
            false,
          ),
        } : {
          [currentTarget.name]: currentValue,
        },
      },
      optionFile!,
      fullOption,
    );

    onOptionDataChange(option.id, newOption, newFullOption);
  }, [option,
    optionFile,
    fullOption,
    onOptionDataChange]);

  const onDeleteOptionBtnClick = useCallback(() => {
    deleteOption(option.id);
    onValidation(clearIDRelatedValidationErrors(validationErrors, option.id));
  }, [option.id, validationErrors, onValidation, deleteOption]);

  const onAddOptionItemBtnClick = useCallback(() => {
    const newId = getRandomId();
    const { newOption, newFullOption } = generateGameSettingsOption(
      {
        ...option,
        items: [
          {
            ...defaultGameSettingsOptionItem,
            id: newId,
          },
          ...option.items],
      },
      optionFile!,
      fullOption,
    );

    onValidation(validateOptionTypeRelatedFields(
      newOption,
      optionFile!,
      validationErrors,
    ));

    onOptionDataChange(option.id, newOption, newFullOption);
    setLastAddedItemId(newId);
  }, [option, fullOption, optionFile, validationErrors, onValidation, onOptionDataChange]);

  const deleteOptionItem = useCallback((
    newItems: IGameSettingsOptionItem[],
    deletedItem: IGameSettingsOptionItem,
  ) => {
    const newOption = { ...option, items: newItems };
    if (option.optionType === GameSettingsOptionType.COMBINED) {
      onValidation(validateControllerTypeRelatedFields(
        newOption,
        validationErrors,
      ));
    }
    onValidation(option.optionType === GameSettingsOptionType.COMBINED
      ? validateControllerTypeRelatedFields(
        newOption,
        clearIDRelatedValidationErrors(validationErrors, deletedItem.id),
      )
      : clearIDRelatedValidationErrors(validationErrors, deletedItem.id));

    onOptionDataChange(option.id, newOption, { ...fullOption, items: newItems });
  }, [option, fullOption, validationErrors, onValidation, onOptionDataChange]);

  const onDeleteOptionItemBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    deleteOptionItem(
      option.items.filter((currentItem) => currentItem.id !== currentTarget.id.split(':')[1]),
      option.items.find((currentItem) => currentItem.id === currentTarget.id.split(':')[1])!,
    );
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
      <Select
        className={styles.option__item}
        id={`${GameSettingsOptionFields.OPTION_TYPE}_${option.id}`}
        selectOptions={generateSelectOptions(GameSettingsOptionType)}
        name={GameSettingsOptionFields.OPTION_TYPE}
        label="Тип"
        description="Тип опции определяет, сколько значений параметров она может изменять, а так же способ их изменения." //eslint-disable-line max-len
        value={option[GameSettingsOptionFields.OPTION_TYPE]}
        onChange={onOptionInputChange}
      />
      <Select
        className={styles.option__item}
        id={`${GameSettingsOptionFields.FILE}_${option.id}`}
        selectOptions={selectOptionsFiles}
        name={GameSettingsOptionFields.FILE}
        label="Файл"
        description="Игровой файл, из которого используются параметры для опции."
        value={option[GameSettingsOptionFields.FILE]}
        onChange={onOptionInputChange}
      />
      <TextField
        className={styles.option__item}
        id={`${GameSettingsOptionFields.LABEL}_${option.id}`}
        name={GameSettingsOptionFields.LABEL}
        label="Заголовок"
        description="Текст, отображаемый перед контроллером опции."
        value={option[GameSettingsOptionFields.LABEL]}
        isRequied
        validationErrors={validationErrors}
        onChange={onOptionInputChange}
      />
      <TextField
        className={styles.option__item}
        id={`${GameSettingsOptionFields.DESCRIPTION}_${option.id}`}
        name={GameSettingsOptionFields.DESCRIPTION}
        label="Описание"
        description="Текст для всплывающей подсказки. Аналогична данной подсказке."
        value={option[GameSettingsOptionFields.DESCRIPTION]}
        onChange={onOptionInputChange}
      />
      {
        gameSettingsGroups.length !== 0 && (
          <Select
            className={styles.option__item}
            id={`${GameSettingsOptionFields.SETTING_GROUP}_${option.id}`}
            label="Группа настроек"
            description="Задает группу, к которой приналежит опция."
            selectOptions={selectOptionsGroups}
            name={GameSettingsOptionFields.SETTING_GROUP}
            value={option[GameSettingsOptionFields.SETTING_GROUP]}
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
            label="Контроллер"
            description="Определяет, с помощью какого контроллера будет изменяться значение опции." //eslint-disable-line max-len
            value={option[GameSettingsOptionFields.CONTROLLER_TYPE]}
            onChange={onOptionInputChange}
          />
        )
      }
      {
        option.separator !== undefined && (
          <Select
            className={styles.option__item}
            id={`${GameSettingsOptionFields.SEPARATOR}_${option.id}`}
            name={GameSettingsOptionFields.SEPARATOR}
            selectOptions={generateSelectOptions(availableOptionSeparators)}
            label="Разделитель"
            description="Выбранный разделитьель следует применять при написании опций для селектора в поле 'Опции селектора'." //eslint-disable-line max-len
            value={option[GameSettingsOptionFields.SEPARATOR]}
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
            description="Определяет, какие варианты будут доступны для выбора. Представляет собой последовательность пар 'Заголовок'='Значение параметра'." //eslint-disable-line max-len
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
            description="Минимальное значение диапазона значений параметра."
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
            description="Максимальное значение диапазона значений параметра."
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
            description="Величина, на которую будет изменяться значение в контроллере."
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
                  id={`${GameSettingsOptionFields.NAME}_${option.id}_${item.id}`}
                  parent={option.id}
                  name={GameSettingsOptionFields.NAME}
                  label="Имя параметра"
                  description={`Имя${item.valueAttribute !== undefined ? ' тега' : ''} параметра для опции. Все параметры следует брать из того файла, который выбран в поле 'Файл'.`} //eslint-disable-line max-len
                  value={item[GameSettingsOptionFields.NAME]}
                  isRequied
                  validationErrors={validationErrors}
                  onChange={onOptionInputChange}
                />
                {
                  item.iniGroup !== undefined && (
                  <TextField
                    className={styles.option__item}
                    id={`${GameSettingsOptionFields.INI_GROUP}_${option.id}_${item.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.INI_GROUP}
                    label="Группа параметра"
                    description="Группа, в которой находится параметр в файле. Не путать со значение поля 'Группа настроек'." //eslint-disable-line max-len
                    value={item[GameSettingsOptionFields.INI_GROUP]!}
                    isRequied
                    validationErrors={validationErrors}
                    onChange={onOptionInputChange}
                  />
                  )
                }
                {
                  item.valueAttribute !== undefined && (
                  <TextField
                    className={styles.option__item}
                    id={`${GameSettingsOptionFields.VALUE_ATTRIBUTE}_${option.id}_${item.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.VALUE_ATTRIBUTE}
                    label="Имя атрибута параметра"
                    description="Атрибут тега параметра, в котором находится значение для опции."
                    value={item[GameSettingsOptionFields.VALUE_ATTRIBUTE]!}
                    validationErrors={validationErrors}
                    onChange={onOptionInputChange}
                  />
                  )
                }
                {
                  item.valuePath !== undefined && (
                  <TextField
                    className={styles.option__item}
                    id={`${GameSettingsOptionFields.VALUE_PATH}_${option.id}_${item.id}`}
                    parent={option.id}
                    name={GameSettingsOptionFields.VALUE_PATH}
                    label="Путь до параметра"
                    description="Путь до тега, в котором лежит тег параметра, из которого берется значение для опции." //eslint-disable-line max-len
                    placeholder="path/to/parametertag"
                    value={item[GameSettingsOptionFields.VALUE_PATH]!}
                    validationErrors={validationErrors}
                    onChange={onOptionInputChange}
                  />
                  )
                }
                {
                  item.controllerType !== undefined && (
                    <Select
                      className={styles.option__item}
                      id={`${GameSettingsOptionFields.CONTROLLER_TYPE}_${option.id}_${item.id}`}
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
                      id={`${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${option.id}_${item.id}`}
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
                      id={`${GameSettingsOptionFields.MIN}_${option.id}_${item.id}`}
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
                      id={`${GameSettingsOptionFields.MAX}_${option.id}_${item.id}`}
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
                      id={`${GameSettingsOptionFields.STEP}_${option.id}_${item.id}`}
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
