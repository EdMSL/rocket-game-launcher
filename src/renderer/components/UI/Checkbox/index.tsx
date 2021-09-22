import React from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { IUIElementProps } from '$types/gameSettings';

interface IProps extends IUIElementProps<HTMLInputElement> {
  isChecked: boolean,
  classNameCheckbox?: string | null,
}

export const Checkbox: React.FunctionComponent<IProps> = ({
  id,
  name = id,
  parent = '',
  label = '',
  description = '',
  isChecked,
  isDisabled = false,
  className = null,
  classNameCheckbox = null,
  currentHintId = '',
  multiparameters = '',
  onChange,
  onHover = null,
  onLeave = null,
}) => (
  <div className={classNames('checkbox__block', className)}>
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
      className={classNames('checkbox__label', classNameCheckbox)}
      htmlFor={id}
    >
      <span>{label}</span>
      {
          description
          && onHover
          && onLeave
          && (
            <GameSettingsHintBlock
              id={id}
              description={description}
              currentHintId={currentHintId}
              onHover={onHover}
              onLeave={onLeave}
            />
          )
        }
    </label>
  </div>
);
