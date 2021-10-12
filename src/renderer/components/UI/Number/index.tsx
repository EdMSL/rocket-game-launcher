import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

interface IProps extends IUIElementProps<HTMLInputElement> {

}

export const Number: React.FunctionComponent<IProps> = ({
  id,
  label,
  name = id,
  value,
  className = '',
  parentClassname = '',
  description = '',
  currentHintId = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  onChange,
  onHover = null,
  onLeave = null,
}) => (
  <div className={classNames(
    'number__container',
    parentClassname && `${parentClassname}-number__container`,
    className,
  )}
  >
    <label
      className="number__label"
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
            currentHintId={currentHintId}
            description={description}
            onHover={onHover}
            onLeave={onLeave}
          />
        )
      }
    </label>
    <input
      className="number__input"
      type="number"
      id={id}
      name={name}
      value={value}
      data-parent={parent}
      data-multiparameters={multiparameters}
      disabled={isDisabled}
      onChange={onChange}
    />
  </div>
);
