import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';
import { TEXT_INPUT_MAX_LENGTH } from '$constants/defaultData';

interface IProps extends IUIElementProps<HTMLInputElement> {
  value: string,
}

export const TextField: React.FunctionComponent<IProps> = ({
  id,
  label,
  name,
  value,
  className = '',
  parentClassname,
  description,
  maxLength = TEXT_INPUT_MAX_LENGTH,
  parent,
  multiparameters,
  isDisabled = false,
  validationErrors,
  onChange,
}) => (
  <div className={classNames(
    'text-field__container',
    parentClassname && `${parentClassname}-text-field__container`,
    className,
  )}
  >
    <label
      className="text-field__label"
      htmlFor={id}
    >
      <span>{label}</span>
      {
        description && <HintItem description={description} />
      }
    </label>
    <input
      className={classNames(
        'text-field__input',
        validationErrors && validationErrors.length > 0 && 'text-field__input--error',
      )}
      type="text"
      id={id}
      name={name}
      value={value}
      maxLength={maxLength}
      data-parent={parent}
      data-multiparameters={multiparameters}
      disabled={isDisabled}
      onChange={onChange}
    />
  </div>
);
