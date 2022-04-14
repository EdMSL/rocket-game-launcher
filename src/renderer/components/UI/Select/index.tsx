import React from 'react';
import classNames from 'classnames';

import { HintItem } from '$components/HintItem';
import { IUIControllerSelect, IUIElementProps } from '$types/common';

interface IProps extends IUIElementProps<HTMLSelectElement>, IUIControllerSelect {
  isCombined?: boolean,
  separator?: string,
}

const defaultOptionsArr = [{
  label: 'None',
  value: 'None',
}];

export const Select: (React.FunctionComponent<IProps>) = ({
  label = '',
  description = '',
  id,
  name = id,
  parent,
  separator = '',
  multiparameters = '',
  isCombined,
  value,
  isDisabled = false,
  options,
  className = '',
  parentClassname = '',
  onChange,
}) => {
  const currentOptionsArr = options.length !== 0 ? options : defaultOptionsArr;

  return (
    <div className={classNames(
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
        data-iscombined={isCombined}
        data-separator={separator}
        data-multiparameters={multiparameters}
        onChange={onChange}
        value={value}
        disabled={isDisabled || options.length <= 1}
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
