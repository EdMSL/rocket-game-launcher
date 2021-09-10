import React from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

interface IProps {
  id: string,
  name?: string,
  parent?: string,
  group?: string,
  label: string,
  description?: string,
  isChecked: boolean,
  isDisabled?: boolean,
  className?: string | null,
  classNameCheckbox?: string | null,
  currentHintId?: string,
  multiparameters?: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  onHover?: (id: string) => void,
  onLeave?: () => void,
}

export const Checkbox: React.FunctionComponent<IProps> = ({
  id,
  name = id,
  parent = '',
  group = '',
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
      data-group={group}
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
          id !== 'resolutionCheckbox'
          && description
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
