import React, { useCallback } from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';

interface IProps extends IUIElementProps<HTMLInputElement> {
  min?: number|'',
}

export const NumberField: React.FunctionComponent<IProps> = ({
  id,
  label,
  name,
  value,
  min = 0,
  className = '',
  description,
  parentClassname,
  parent,
  multiparameters,
  isDisabled = false,
  validationErrors,
  onChange,
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
          description && <HintItem description={description} />
        }
      </label>
      <input
        className={classNames(
          'number-field__input',
          validationErrors && validationErrors.length > 0 && 'number-field__input--error',
        )}
        type="number"
        min={min}
        id={id}
        name={name}
        value={value}
        title=""
        data-parent={parent}
        data-multiparameters={multiparameters}
        disabled={isDisabled}
        onChange={onChange}
        onBlur={onInputBlur}
      />
    </div>
  );
};
