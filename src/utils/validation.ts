import { GameSettingsFileView, GameSettingsOptionType } from '$constants/misc';
import { IValidationErrors } from '$types/common';
import { IGameSettingsFile, IGameSettingsOption } from '$types/gameSettings';
import { ILauncherConfig } from '$types/main';

const MAX_PATH_LENGTH = 255;

/**
 * Проверка имени папки на корректность.
 * @param name Имя для проверки.
 * @returns Является ли имя корректным.
*/
export const isValidFolderName = (name: string): boolean => {
  if (typeof name !== 'string' || name.length > MAX_PATH_LENGTH) {
    return false;
  }

  if (/.+\.\s*$/.test(name)) {
    return false;
  }

  return !/[<>:"/\\|?*]/.test(name);
};

/**
 *Очищает при удалении компонента все ошибки валидации, связанные этим компонентом.
 * @param validationErrors Текущие ошибки валидации.
 * @param id id удаляемого компонента.
 * @returns Ошибки валидации без ошибок, привязанных к текущему компоненту.
 */
export const clearValidationErrors = (
  validationErrors: IValidationErrors,
  id: string,
): IValidationErrors => Object.keys(validationErrors).filter((error) => !error.includes(id)).reduce((acc, current) => ({
  ...acc,
  [current]: validationErrors[current],
}), {});

/**
 * Получить ошибки валидации полей с уникальными значениями.
 * @param currentErrors Текущие ошибки валидации.
 * @param newErrorsOrForClear Ошибки валидации для добавления или для очистки.
 * @param isForAdd Очищать ошибки из списка или добавлять новые ошибки в список.
 * @returns Объект с ошибками валидации.
*/
export const getUniqueValidationErrors = (
  currentErrors: IValidationErrors,
  newErrorsOrForClear: IValidationErrors,
  isForAdd: boolean,
): IValidationErrors => {
  const newErrors = Object.keys(newErrorsOrForClear).reduce<IValidationErrors>((acc, id) => {
    if (isForAdd) {
      return {
        ...currentErrors,
        ...acc,
        [id]: Array.from(new Set([...currentErrors[id] ? currentErrors[id] : [], ...newErrorsOrForClear[id]])),
      };
    }

    if (currentErrors[id]) {
      return {
        ...currentErrors,
        ...acc,
        [id]: [...currentErrors[id].filter((currError) => !newErrorsOrForClear[id].includes(currError))],
      };
    }

    return {
      ...currentErrors,
      ...acc,
      [id]: [],
    };
  }, {});

  return Object.keys(newErrors).reduce((acc, id) => {
    if (newErrors[id].length > 0) {
      return {
        ...acc,
        [id]: newErrors[id],
      };
    }

    return {
      ...acc,
    };
  }, {});
};

/**
  Валидация значений полей `number` в `developer screen`.
  @param target Поле `target` объекта `event`.
  @param currentConfig Текущие значения конфигурации лаунчера.
  @param currentErrors Текущие ошибки валидации.
  @returns Массив из двух массивов: ошибки для добавления и ошибки для удаления.
*/
export const validateNumberInputs = (
  target: EventTarget & HTMLInputElement,
  currentConfig: ILauncherConfig,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  errors = getUniqueValidationErrors(
    errors,
    { [target.id]: ['less min value'] },
    +target.value < +target.min,
  );

  if (currentConfig.isResizable) {
    const namesAndValues = target.name === 'width'
      ? {
          default: currentConfig.width,
          min: currentConfig.minWidth,
          max: currentConfig.maxWidth,
          defaultName: 'width',
          minName: 'minWidth',
          maxName: 'maxWidth',
        }
      : {
          default: currentConfig.height,
          min: currentConfig.minHeight,
          max: currentConfig.maxHeight,
          defaultName: 'height',
          minName: 'minHeight',
          maxName: 'maxHeight',
        };

    if (target.name === 'width' || target.name === 'height') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.minName}`],
          [namesAndValues.minName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.min,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.maxName}`],
          [namesAndValues.maxName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.max && namesAndValues.max > 0,
      );
    } else if (target.name === 'minWidth' || target.name === 'minHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.defaultName}`],
          [namesAndValues.defaultName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.default,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.maxName}`],
          [namesAndValues.maxName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.max && namesAndValues.max > 0,
      );
    } else if (target.name === 'maxWidth' || target.name === 'maxHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.defaultName}`],
          [namesAndValues.defaultName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.default && +target.value > 0,
      );
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.minName}`],
          [namesAndValues.minName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.min && +target.value > 0,
      );
    }
  }
  return errors;
};

const validateOptionItemFields = (option: IGameSettingsOption): IValidationErrors => {
  let errors: IValidationErrors = {};

  option.items?.forEach((item) => {
    if (item.name === '') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`name_${item.id}`]: ['empty value'],
          [`${option.id}_name:${item.id}`]: ['item error'],
        },
        item.name === '',
      );
    }

    if (item.iniGroup !== undefined) {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`iniGroup_${item.id}`]: ['empty value'],
          [`${option.id}_iniGroup:${item.id}`]: ['item error'],
        },
        item.iniGroup === '',
      );
    }

    if (item.valueName !== undefined) {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`valueName_${item.id}`]: ['empty value'],
          [`${option.id}_valueName:${item.id}`]: ['item error'],
        },
        item.valueName === '',
      );
    }

    if (item.valuePath !== undefined) {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`valuePath_${item.id}`]: ['empty value'],
          [`${option.id}_valuePath:${item.id}`]: ['item error'],
        },
        item.valuePath === '',
      );
    }
  });

  return errors;
};

export const setOptionStartValidationErrors = (
  option: IGameSettingsOption,
  file: IGameSettingsFile,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  if (
    option.optionType === GameSettingsOptionType.DEFAULT
  ) {
    errors = getUniqueValidationErrors(
      errors,
      { [`name_${option.id}`]: ['empty value'] },
      option.name === '',
    );

    if (file.view === GameSettingsFileView.SECTIONAL) {
      errors = getUniqueValidationErrors(
        errors,
        { [`iniGroup_${option.id}`]: ['empty value'] },
        option.iniGroup === '',
      );
    } else if (GameSettingsFileView.TAG) {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`valueName_${option.id}`]: ['empty value'],
        },
        option.valueName === '',
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [`valuePath_${option.id}`]: ['empty value'],
        },
        option.valuePath === '',
      );
    }
  } else if (option.items!?.length > 0) {
    errors = validateOptionItemFields(option);
  }

  return errors;
};

export const validateOptionFields = (
  target: EventTarget & (HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement),
  option: IGameSettingsOption,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  if (target.type === 'text' && target.required) {
    errors = getUniqueValidationErrors(
      errors,
      { [target.id]: ['empty value'] },
      target.value === '',
    );
  }

  if (
    option.optionType === GameSettingsOptionType.DEFAULT
  ) {
    errors = getUniqueValidationErrors(
      errors,
      { [`name_${option.id}`]: ['empty value'] },
      option.name === '',
    );
  } else if (option.items!?.length > 0) {
    errors = validateOptionItemFields(option);
  }

  return errors;
};
