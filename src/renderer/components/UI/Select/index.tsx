import React from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { IUIElementProps } from '$types/gameSettings';

export interface ISelectOption {
  label: string,
  value: string,
}

interface IProps extends IUIElementProps<HTMLSelectElement> {
  isCombined?: boolean,
  separator?: string,
  value: string,
  optionsArr: ISelectOption[],
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
  isCombined = false,
  value,
  isDisabled = false,
  optionsArr,
  className = null,
  currentHintId = '',
  onChange,
  onHover = null,
  onLeave = null,
}) => {
  const currentOptionsArr = optionsArr.length !== 0 ? optionsArr : defaultOptionsArr;

  return (
    <div className={classNames('select__block', className)}>
      {
        label && (
          <label
            className="select__label"
            htmlFor={id}
          >
            <span className="select__label-text">{label}</span>
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
        disabled={isDisabled || optionsArr.length === 0}
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
