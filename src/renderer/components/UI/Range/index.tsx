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
  hintParameter?: string,
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
  label,
  description = '',
  valueText = '',
  className = null,
  hintParameter = '',
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
              hintParameter={hintParameter}
              description={description}
              iniName={parent}
              iniGroup={group}
              parametersNames={[name]}
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
              className={classNames('button', 'range__button')}
              name="minus"
              onClick={onRangeBtnClick}
            >
              {/*eslint-disable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
              <svg height="12px" width="12px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M368 272H144c-8.832 0-16-7.168-16-16s7.168-16 16-16h224c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0"/><path d="M453.332 512H58.668C26.305 512 0 485.695 0 453.332V58.668C0 26.305 26.305 0 58.668 0h394.664C485.695 0 512 26.305 512 58.668v394.664C512 485.695 485.695 512 453.332 512zM58.668 32C43.968 32 32 43.969 32 58.668v394.664C32 468.032 43.969 480 58.668 480h394.664c14.7 0 26.668-11.969 26.668-26.668V58.668C480 43.968 468.031 32 453.332 32zm0 0" /></svg>
              {/*eslint-enable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
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
              className={classNames('button', 'range__input')}
              name="plus"
              onClick={onRangeBtnClick}
            >
              {/*eslint-disable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
              <svg height="12px" width="12px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M368 272H144c-8.832 0-16-7.168-16-16s7.168-16 16-16h224c8.832 0 16 7.168 16 16s-7.168 16-16 16zm0 0"/><path d="M256 384c-8.832 0-16-7.168-16-16V144c0-8.832 7.168-16 16-16s16 7.168 16 16v224c0 8.832-7.168 16-16 16zm0 0"/><path d="M453.332 512H58.668C26.305 512 0 485.695 0 453.332V58.668C0 26.305 26.305 0 58.668 0h394.664C485.695 0 512 26.305 512 58.668v394.664C512 485.695 485.695 512 453.332 512zM58.668 32C43.968 32 32 43.969 32 58.668v394.664C32 468.032 43.969 480 58.668 480h394.664c14.7 0 26.668-11.969 26.668-26.668V58.668C480 43.968 468.031 32 453.332 32zm0 0"/></svg>
              {/*eslint-enable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
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
