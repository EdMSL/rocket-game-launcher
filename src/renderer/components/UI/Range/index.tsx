import React, { useCallback } from 'react';
import classNames from 'classnames';

import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { RangeButtonName } from '$constants/misc';
import { IUIElementProps } from '$types/gameSettings';

interface IProps extends IUIElementProps<HTMLInputElement> {
  value: string,
  min: number,
  max: number,
  step: number,
  valueText: string,
  onButtonClick?: (
    btnName: string,
    parent: string,
    name: string,
    min: number,
    max: number,
    step: number,
  ) => void,
}

export const Range: React.FunctionComponent<IProps> = ({
  id,
  name = id,
  parent = '',
  multiparameters = '',
  value,
  min,
  max,
  step,
  isDisabled,
  label = '',
  description = '',
  valueText = '',
  className = '',
  parentClassname = '',
  currentHintId = '',
  onChange,
  onButtonClick = null,
  onHover = null,
  onLeave = null,
}) => {
  const onRangeBtnClick = useCallback(({ currentTarget }) => {
    if (onButtonClick) {
      onButtonClick(currentTarget.name, parent, name, min, max, step);
    }
  }, [onButtonClick, parent, name, step, max, min]);

  return (
    <div className={classNames(
      'range__container',
      parentClassname && `${parentClassname}-range__container`,
      className,
    )}
    >
      <div className="range__label">
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
      </div>
      <div className="range__controls">
        {
          onButtonClick && (
            <button
              type="button"
              className={classNames('button', 'range__button', 'range__button--decrease')}
              name={RangeButtonName.DECREASE}
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
          data-parent={parent}
          data-multiparameters={multiparameters}
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
              name={RangeButtonName.INCREASE}
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
