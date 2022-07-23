import React from 'react';
import classNames from 'classnames';

import { IUIControllerCheckbox, IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';

interface IProps extends IUIElementProps<HTMLInputElement>, IUIControllerCheckbox {}

export const Switcher: React.FunctionComponent<IProps> = ({
  id,
  name,
  label,
  className = '',
  parentClassname = '',
  description = '',
  parent,
  multiparameters,
  isDisabled = false,
  isChecked,
  onChange,
}) => (
  <div className={classNames(
    'ui__container',
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
