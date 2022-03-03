import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { HintItem } from '$components/HintItem';
import { TEXT_INPUT_MAX_LENGTH } from '$constants/defaultParameters';

interface IProps extends IUIElementProps<HTMLInputElement> {
  value: string,
}

export const TextField: React.FunctionComponent<IProps> = ({
  id,
  label,
  name = id,
  value,
  className = '',
  parentClassname = '',
  description = '',
  maxLength = TEXT_INPUT_MAX_LENGTH,
  parent = '',
  multiparameters = '',
  isDisabled = false,
  isValidationError,
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
      className={classNames('text-field__input', isValidationError && 'text-field__input--error')}
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
