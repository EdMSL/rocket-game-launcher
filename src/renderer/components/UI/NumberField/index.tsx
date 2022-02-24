import React, { useCallback } from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

interface IProps extends IUIElementProps<HTMLInputElement> {
  min?: number,
}

export const NumberField: React.FunctionComponent<IProps> = ({
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
  min = 0,
  isValidationError,
  onChange,
  onHover = null,
  onLeave = null,
}) => {
  const onInputBlur = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (+event.target.value !== +value!) {
      onChange(event);
    }
  }, [value, onChange]);

  return (
    <div className={classNames(
      'number-field__container',
      parentClassname && `${parentClassname}-number-field__container`,
      className,
    )}
    >
      <label
        className="number-field__label"
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
        className={classNames(
          'number-field__input',
          isValidationError && 'number-field__input--error',
        )}
        type="number"
        min={min}
        id={id}
        name={name}
        value={value}
        data-parent={parent}
        data-multiparameters={multiparameters}
        disabled={isDisabled}
        onChange={onChange}
        onBlur={onInputBlur}
      />
    </div>
  );
};
