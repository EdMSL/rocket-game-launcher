import React from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

export interface ISelectOption {
  label: string,
  value: string,
}

interface IProps {
  label?: string,
  description?: string,
  id: string,
  name?: string,
  parent?: string,
  multiparameters?: string,
  isCombined?: boolean,
  separator?: string,
  value: string,
  isDisabled?: boolean,
  optionsArr: ISelectOption[],
  className?: string | null,
  currentHintId?: string,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  onHover?: (id: string) => void,
  onLeave?: () => void,
}

const defaultOptionsArr = [{
  label: 'None',
  value: 'None',
}];

export const Select: React.FunctionComponent<IProps> = ({
  label = '',
  description = '',
  id,
  name = id,
  parent = '',
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
