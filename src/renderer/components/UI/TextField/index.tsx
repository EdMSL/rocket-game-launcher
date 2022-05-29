import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import { IUIControllerTextField, IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';
import { TEXT_INPUT_MAX_LENGTH } from '$constants/defaultData';

interface IProps extends IUIElementProps<HTMLInputElement>, IUIControllerTextField {
  value: string,
}

export const TextField: React.FunctionComponent<IProps> = ({
  id,
  label,
  name,
  value,
  className = '',
  parentClassname,
  description,
  maxLength = TEXT_INPUT_MAX_LENGTH,
  parent,
  multiparameters,
  isDisabled = false,
  isRequied = false,
  validationErrors,
  placeholder,
  isFocus,
  isSelect,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocus) inputRef.current?.focus();
    if (isSelect) inputRef.current?.select();
  }, [isFocus, isSelect]);

  return (
    <div className={classNames(
      'ui__container',
      'text-field__container',
      parentClassname && `${parentClassname}-text-field__container`,
      className,
    )}
    >
      <label
        className="text-field__label"
        htmlFor={id}
      >
        <span>{label}</span>
        {
          description && <HintItem description={description} />
        }
      </label>
      <input
        className={classNames(
          'text-field__input',
          validationErrors && validationErrors[id]?.length > 0 && 'text-field__input--error',
        )}
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        maxLength={maxLength}
        data-parent={parent}
        data-multiparameters={multiparameters}
        disabled={isDisabled}
        required={isRequied}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};
