import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';

interface IProps extends IUIElementProps<HTMLInputElement> {
  isChecked: boolean,
}

export const Switcher: React.FunctionComponent<IProps> = ({
  id,
  label,
  name = id,
  className = '',
  parentClassname = '',
  description = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  isChecked,
  onChange,
}) => (
  <div className={classNames(
    'switcher__container',
    parentClassname && `${parentClassname}-switcher__container`,
    className,
  )}
  >
    <input
      className={classNames('visually-hidden', 'switcher__input')}
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
      htmlFor={id}
      className={classNames('switcher__label')}
    >
      <span className={classNames('switcher__label-text')}>
        {label}
      </span>
      {
        description && <HintItem description={description} />
      }
    </label>
  </div>
);
