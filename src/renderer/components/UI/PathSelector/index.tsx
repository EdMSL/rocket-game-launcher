import React, { useCallback } from 'react';
import classNames from 'classnames';

import { IUIElementProps } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { Button } from '../Button';

interface IProps extends IUIElementProps<HTMLInputElement> {
  onButtonClick: (id: string, parent: string) => void,
}

export const PathSelector: React.FC<IProps> = ({
  id,
  label,
  name = id,
  value,
  className = '',
  parentClassname = '',
  description = '',
  currentHintId = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  onChange,
  onButtonClick,
  onHover = null,
  onLeave = null,
}) => {
  const onSelectPatchBtnClick = useCallback(() => {
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
