import React from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

interface IProps extends IUIElementProps<HTMLInputElement> {
  isChecked: boolean,
  parentClassname?: string,
}

export const Switcher: React.FunctionComponent<IProps> = ({
  id,
  label,
  name = id,
  parentClassname = '',
  description = '',
  currentHintId = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  isChecked,
  onChange,
  onHover = null,
  onLeave = null,
}) => (
  <div className={classNames(
    'switcher__container',
    parentClassname && `${parentClassname}-switcher__container`,
  )}
  >
    <p className={classNames(
      'switcher__label',
      parentClassname && `${parentClassname}-switcher__label`,
    )}
    >
      <span className={classNames(
        'switcher__label-text',
        parentClassname && `${parentClassname}-switcher__label-text`,
      )}
      >
        {label}
      </span>
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
    </p>
    <div className={classNames(
      'switcher__block',
      parentClassname && `${parentClassname}-switcher__block`,
    )}
    >
      <input
        className={classNames(
          'visually-hidden',
          'switcher__checkbox',
          parentClassname && `${parentClassname}-switcher__checkbox`,
        )}
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
        className={classNames(
          'switcher__toggler',
          parentClassname && `${parentClassname}-switcher__toggler`,
        )}
      />
    </div>
  </div>
);
