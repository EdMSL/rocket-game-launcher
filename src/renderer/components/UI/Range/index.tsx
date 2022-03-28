import React, {
  useCallback, useState, useEffect,
} from 'react';
import classNames from 'classnames';

import { HintItem } from '$components/HintItem';
import { RangeButtonName } from '$constants/misc';
import { IUIElementProps } from '$types/common';
import { getNumberOfDecimalPlaces } from '$utils/strings';
import { useDebouncedFunction } from '$utils/hooks';

interface IProps extends IUIElementProps<HTMLInputElement> {
  defaultValue: string,
  min: number,
  max: number,
  step: number,
  onChangeBtnClick?: (
    btnName: string,
    id: string,
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
  defaultValue,
  min,
  max,
  step,
  isDisabled,
  label = '',
  description = '',
  className = '',
  parentClassname = '',
  onChange,
  onChangeBtnClick = null,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const onRangeBtnClick = useCallback(({ currentTarget }) => {
    if (onChangeBtnClick) {
      onChangeBtnClick(currentTarget.name, id, min, max, step);
    }
  }, [onChangeBtnClick, id, step, max, min]);

  const debouncedChangeValue = useDebouncedFunction(
    (newValue) => onChange(newValue),
  );

  const onInputChange = (event): void => {
    const newValue = /\./g.test(defaultValue)
      ? (+event.target.value).toFixed(getNumberOfDecimalPlaces(defaultValue))
      : event.target.value;

    setValue(newValue);
    debouncedChangeValue(event);
  };

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
          description && <HintItem description={description} />
        }
      </div>
      <div className="range__controls">
        {
          onChangeBtnClick && (
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
          onChange={onInputChange}
        />
        {
          onChangeBtnClick && (
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
        {value}
      </p>
    </div>
  );
};
