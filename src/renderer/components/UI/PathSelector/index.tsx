import React, { useCallback } from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { Button } from '../Button';
import { ISelectOption } from '../Select';

interface IProps extends IUIElementProps<HTMLInputElement> {
  options: ISelectOption[],
  isSelectDisabled?: boolean,
  onButtonClick: (id: string, parent: string) => void,
}

export const PathSelector: React.FC<IProps> = ({
  id,
  label,
  name = id,
  value,
  options,
  className = '',
  parentClassname = '',
  description = '',
  currentHintId = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  isSelectDisabled = options.length <= 1,
  onChange,
  onButtonClick,
  onHover = null,
  onLeave = null,
}) => {
  const onSelectPatchBtnClick = useCallback(() => {
    onButtonClick(id, parent);
  }, [id, parent, onButtonClick]);

  const onSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onButtonClick(id, parent);
  }, [id, parent, onButtonClick]);

  return (
    <div className={classNames(
      'path-selector__container',
      parentClassname && `${parentClassname}-path-selector__container`,
      className,
    )}
    >
      <label
        className="path-selector__label"
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
            currentHintId={currentHintId}
            description={description}
            onHover={onHover}
            onLeave={onLeave}
          />
        )
      }
      </label>
      <div className="path-selector__input-block">
        <select
          className="path-selector__select"
          onChange={onSelectChange}
          value={options[0].value}
          disabled={isSelectDisabled}
        >
          {
          options.map((option) => (
            <option
              key={`option-${option.label}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        }
        </select>
        <input
          className="path-selector__input"
          id={id}
          name={name}
          type="text"
          value={value}
          data-parent={parent}
          data-multiparameters={multiparameters}
          disabled={isDisabled}
          onChange={onChange}
        />
        <Button
          className="path-selector__input-btn"
          onClick={onSelectPatchBtnClick}
          isDisabled={isDisabled}
        >
          Выбрать папку
        </Button>
      </div>
    </div>
  );
};
