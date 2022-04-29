import React from 'react';
import classNames from 'classnames';

import { IUIControllerTextField, IUIElementProps } from '$types/common';
import { HintItem } from '$components/HintItem';

interface IProps extends IUIElementProps<HTMLTextAreaElement>, IUIControllerTextField {
  wrap?: string,
}

export const TextArea: React.FunctionComponent<IProps> = ({
  id,
  label,
  name,
  value,
  className = '',
  description,
  parent,
  multiparameters,
  wrap = 'default',
  placeholder = '',
  isDisabled = false,
  validationErrors,
  onChange,
}) => (
  <div className={classNames(
    'ui__container',
    'text-area__container',
    className,
  )}
  >
    <label
      className="text-area__label"
      htmlFor={id}
    >
      <span>{label}</span>
      {
        description && <HintItem description={description} />
      }
    </label>
    <textarea
      className={classNames(
        'text-area__input',
        validationErrors && validationErrors[id]?.length > 0 && 'text-area__input--error',
      )}
      id={id}
      name={name}
      value={value}
      data-parent={parent}
      data-multiparameters={multiparameters}
      disabled={isDisabled}
      wrap={wrap}
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);
