import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  item: string,
  id: string,
  isError: boolean,
  placeholder?: string,
  isNew?: boolean,
  className?: string,
  onApply: (value: string, id: string) => void,
  onDelete: (id: string) => void,
  onChange: (value: string, id: string) => void,
}

export const EditableItem: React.FC<IProps> = ({
  item,
  id,
  isError,
  placeholder,
  isNew = false,
  className = '',
  onChange,
  onApply,
  onDelete,
}) => {
  const labelInput = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState<boolean>(isNew);
  const [currentItem, setCurrentItem] = useState<string>(item);

  const confirmChanges = useCallback(() => {
    onApply(currentItem, id);
    setIsEditMode(false);
  }, [currentItem, id, onApply]);

  const cancelChanges = useCallback(() => {
    if (isNew) {
      onDelete(id);
    } else {
      setIsEditMode(false);
      setCurrentItem(item);
    }
  }, [item, id, isNew, onDelete]);

  const onEscKeyPress = useCallback((event: KeyboardEvent) => {
    if (isEditMode && event.code === 'Escape') {
      cancelChanges();
    }
  }, [isEditMode, cancelChanges]);

  const onEnterKeyPress = useCallback((event: KeyboardEvent) => {
    if (isEditMode && event.code === 'Enter') {
      confirmChanges();
    }
  }, [isEditMode, confirmChanges]);

  useEffect(() => {
    const label = labelInput.current;

    label?.addEventListener('keyup', onEscKeyPress);
    label?.addEventListener('keyup', onEnterKeyPress);

    return (): void => {
      label?.removeEventListener('keyup', onEscKeyPress);
      label?.removeEventListener('keyup', onEnterKeyPress);
    };
  }, [onEscKeyPress, onEnterKeyPress]);

  const onSaveBtnClick = useCallback(() => {
    if (isEditMode && currentItem) {
      confirmChanges();
    }
  }, [isEditMode, currentItem, confirmChanges]);

  const onGroupInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCurrentItem(target.value);
    onChange(target.value, id);
  }, [id, onChange]);

  const onEditBtnClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const onDeleteBtnClick = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  const onCancelBtnClick = useCallback(() => {
    cancelChanges();
  }, [cancelChanges]);

  return (
    <React.Fragment>
      {
        !isEditMode && (
        <div className={classNames(
          styles['editable-item'],
          className,
        )}
        >
          <span className={styles['editable-item__text']}>{item}</span>
          <Button
            className={styles['editable-item__btn']}
            onClick={onEditBtnClick}
          >
            {/* eslint-disable react/jsx-max-props-per-line, max-len */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            {/* eslint-enable react/jsx-max-props-per-line, max-len */}
          </Button>
          <Button
            className={styles['editable-item__btn']}
            onClick={onDeleteBtnClick}
          >
            {/* eslint-disable react/jsx-max-props-per-line, max-len */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgb(230, 230, 230)">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            {/* eslint-enable react/jsx-max-props-per-line, max-len */}
          </Button>
        </div>
        )
      }
      {
        isEditMode && (
        <div
          className={classNames(
            styles['editable-item'],
            styles['editable-item--editable'],
            isNew && styles['editable-item--new'],
            className,
          )}
        >
          <input
            ref={labelInput}
            className={classNames(
              styles['editable-item__input'],
              isError && styles['editable-item__input--error'],
            )}
            id={`input-${id}`}
            placeholder={placeholder || 'Заголовок'}
            value={currentItem}
            autoFocus
            onChange={onGroupInputChange}
          />
          <Button
            className={styles['editable-item__btn']}
            isDisabled={isError || !currentItem}
            onClick={onSaveBtnClick}
          >
            {/* eslint-disable react/jsx-max-props-per-line, max-len */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20" fill="rgb(230, 230, 230)">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
            {/* eslint-enable react/jsx-max-props-per-line, max-len */}
          </Button>
          <Button
            className={styles['editable-item__btn']}
            onClick={onCancelBtnClick}
          >
            {/* eslint-disable react/jsx-max-props-per-line, max-len */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20" fill="rgb(230, 230, 230)">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
            {/* eslint-enable react/jsx-max-props-per-line, max-len */}
          </Button>
        </div>
        )
      }
    </React.Fragment>
  );
};
