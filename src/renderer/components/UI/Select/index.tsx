import React from 'react';
import classNames from 'classnames';

import { HintItem } from '$components/HintItem';
import { IUIControllerSelect, IUIElementProps } from '$types/common';

interface IProps extends IUIElementProps<HTMLSelectElement>, IUIControllerSelect {
  separator?: string,
}

const defaultSelectOptionsArr = [{
  label: 'None',
  value: 'None',
}];

export const Select: (React.FunctionComponent<IProps>) = ({
  id,
  name,
  label = '',
  description = '',
  parent,
  separator,
  multiparameters,
  optionType,
  value,
  isDisabled = false,
  selectOptions,
  className = '',
  parentClassname = '',
  onChange,
}) => {
  const currentOptionsArr = selectOptions.length !== 0 ? selectOptions : defaultSelectOptionsArr;

  return (
    <div className={classNames(
      'ui__container',
      'select__container',
      parentClassname && `${parentClassname}-select__container`,
      className,
    )}
    >
      {
        label && (
          <label
            className="select__label"
            htmlFor={id}
          >
            <span className="select__label-text">{label}</span>
            {
              description && <HintItem description={description} />
            }
          </label>
        )
      }
      <select
        className="select__input"
        id={id}
        name={name}
        data-parent={parent}
        data-optiontype={optionType}
        data-separator={separator}
        data-multiparameters={multiparameters}
        onChange={onChange}
        value={value}
        disabled={isDisabled || selectOptions.length <= 1}
      >
        {
          currentOptionsArr.map((option) => (
            <option
              key={`option-${option.label}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        }
      </select>
    </div>
  );
};
