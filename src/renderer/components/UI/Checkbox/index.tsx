import React from 'react';
import classNames from 'classnames';

import { HintItem } from '$components/HintItem';
import { IUIElementProps } from '$types/gameSettings';

interface IProps extends IUIElementProps<HTMLInputElement> {
  isChecked: boolean,
}

export const Checkbox: React.FunctionComponent<IProps> = ({
  id,
  name = id,
  parent = '',
  label = '',
  description = '',
  isChecked,
  isDisabled = false,
  className = '',
  parentClassname = '',
  multiparameters = '',
  onChange,
}) => (
  <div className={classNames(
    'checkbox__container',
    parentClassname && `${parentClassname}-checkbox__container`,
    className,
  )}
  >
    <input
      className={classNames('visually-hidden', 'checkbox__input')}
      type="checkbox"
      id={id}
      name={name}
      data-parent={parent}
      data-multiparameters={multiparameters}
      checked={isChecked}
      disabled={isDisabled}
      onChange={onChange}
    />
    <label
      className={classNames('checkbox__label')}
      htmlFor={id}
    >
      <span>{label}</span>
      {
        description && <HintItem description={description} />
      }
    </label>
  </div>
);
