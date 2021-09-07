import React from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

const styles = require('./styles.module.scss');

export interface ISelectOptions {
  label: string,
  value: string,
}

interface IProps {
  label?: string,
  description?: string,
  id: string,
  name?: string,
  parent?: string,
  group?: string,
  multiparameters?: string,
  value: string,
  isDisabled?: boolean,
  optionsArr: ISelectOptions[],
  className?: string | null,
  hintParameter?: string,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  onHover?: (id: string) => void,
  onLeave?: () => void,
}

const defaultOptionsArr = [{
  label: 'None',
  value: 'None',
}];

export const Select: React.FunctionComponent<IProps> = ({
  label = null,
  description = '',
  id,
  name = id,
  parent = '',
  group = '',
  multiparameters = '',
  value,
  isDisabled = false,
  optionsArr,
  className = null,
  hintParameter = '',
  onChange,
  onHover = null,
  onLeave = null,
}) => {
  const currentOptionsArr = optionsArr.length !== 0 ? optionsArr : defaultOptionsArr;

  return (
    <div className={classNames(styles.select__block, className)}>
      {
        label && (
          <label
            className={styles.select__label}
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
                  description={description}
                  hintParameter={hintParameter}
                  iniName={parent}
                  iniGroup={group}
                  parametersNames={multiparameters ? multiparameters.split(',') : [name]}
                  onHover={onHover}
                  onLeave={onLeave}
                />
              )
            }
          </label>
        )
      }
      <select
        className={styles.select__input}
        id={id}
        name={name}
        data-parent={parent}
        data-group={group}
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
