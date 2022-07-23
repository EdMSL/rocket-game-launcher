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
    <input
      className={classNames(
        'number-field__input',
        validationErrors && validationErrors[id]?.length > 0 && 'number-field__input--error',
      )}
      type="number"
      id={id}
      name={name}
      value={value}
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
  </div>
);
