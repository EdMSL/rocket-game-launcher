import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';

interface IProps extends IUIElementProps<HTMLInputElement> {
  min?: number|'',
  max?: number|'',
  step?: number,
}

export const NumberField: React.FunctionComponent<IProps> = ({
  id,
  label,
  name,
  value,
  step = 1,
  min = 0,
  max,
  className = '',
  description,
  parentClassname,
  parent,
  multiparameters,
  isDisabled = false,
  validationErrors,
  onChange,
  onBlur,
}) => (
  <div className={classNames(
    'ui__container',
    'number-field__container',
    parentClassname && `${parentClassname}-number-field__container`,
    className,
  )}
  >
    <label
      className="number-field__label"
      htmlFor={id}
    >
      <span>{label}</span>
      {
          description && <HintItem description={description} />
        }
    </label>
    <div className="number-field-input__block">
      <input
        className={classNames(
          'number-field__input',
          validationErrors && validationErrors[id]?.length > 0 && 'number-field__input--error',
        )}
        type="number"
        id={id}
        name={name}
        value={value}
        // title с пустой строкой нужен чтобы он не высвечивался при ошибке валидации
        title=""
        min={min}
        max={max}
        step={step}
        data-parent={parent}
        data-multiparameters={multiparameters}
        disabled={isDisabled}
        onChange={onChange}
        onBlur={onBlur}
      />
      {
        validationErrors && validationErrors[id]?.some((currentError) => currentError.text) && (
          <ul className="input-error__block">
            {
            validationErrors[id]
              .filter((currentError) => currentError.text)
              .map((currentError) => <li key={`${id}${currentError.cause}`}>{currentError.text}</li>)
            }
          </ul>
        )
      }
    </div>
  </div>
);
