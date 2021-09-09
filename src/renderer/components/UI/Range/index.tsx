import React, { useCallback } from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';

interface IProps {
  id: string,
  name?: string,
  group?: string,
  parent: string,
  value: string,
  min: string,
  max: string,
  step: string,
  isDisabled: boolean,
  label: string,
  valueText: string,
  description?: string,
  className?: string | null,
  currentHintId?: string,
  onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void,
  onButtonClick?: (
    btnName: string,
    parent: string,
    name: string,
    step: string,
    max: string,
    min: string,
    group: string,
  ) => void,
  onHover?: (id: string) => void,
  onLeave?: () => void,
}

export const Range: React.FunctionComponent<IProps> = ({
  id,
  name = id,
  parent,
  group = '',
  value,
  min,
  max,
  step,
  isDisabled,
  label = '',
  description = '',
  valueText = '',
  className = null,
  currentHintId = '',
  onChange,
  onButtonClick = null,
  onHover = null,
  onLeave = null,
}) => {
  const onRangeBtnClick = useCallback(({ currentTarget }) => {
    if (onButtonClick) {
      onButtonClick(currentTarget.name, parent, name, step, max, min, group);
    }
  }, [onButtonClick, parent, name, step, max, min, group]);

  return (
    <div className={classNames('range__block', className)}>
      <div className="range__label">
        <span>{label}</span>
        {
          description
          && id !== 'resolutionRange'
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
      </div>
      <div className="range__controls">
        {
          onButtonClick && (
            <button
              type="button"
              className={classNames('button', 'range__button', 'range__button--decrease')}
              name="minus"
              onClick={onRangeBtnClick}
            >
              <span className="range__button-text">-</span>
            </button>
          )
        }
        <input
          className="range__input"
          type="range"
          name={name}
          data-group={group}
          data-parent={parent}
          id={id}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={isDisabled}
          onChange={onChange}
        />
        {
          onButtonClick && (
            <button
              type="button"
              className={classNames('button', 'range__button', 'range__button--increase')}
              name="plus"
              onClick={onRangeBtnClick}
            >
              <span className="range__button-text">+</span>
            </button>
          )
        }
      </div>
      <p className="range__input">
        {valueText}
      </p>
    </div>
  );
};
