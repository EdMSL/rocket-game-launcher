import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

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
    <p className={classNames('switcher__label')}>
      <span className={classNames('switcher__label-text')}>
        {label}
      </span>
      {
        description && <GameSettingsHintBlock description={description} />
      }
    </p>
    <div className={classNames('switcher__block')}>
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
        className={classNames('switcher__toggler')}
      />
    </div>
  </div>
);
