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

  useEffect(() => {
    const label = labelInput.current;

    label?.addEventListener('keyup', onEscKeyPress);

    return (): void => {
      label?.removeEventListener('keyup', onEscKeyPress);
    };
  }, [onEscKeyPress]);

  const onFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
            className={classNames(
              styles['editable-item__btn'],
              styles['editable-item__btn--edit'],
            )}
            onClick={onEditBtnClick}
          >
            Редактировать
          </Button>
          <Button
            className={classNames(
              styles['editable-item__btn'],
              styles['editable-item__btn--delete'],
            )}
            onClick={onDeleteBtnClick}
          >
            Удалить
          </Button>
        </div>
        )
      }
      {
        isEditMode && (
        <form
          className={classNames(
            styles['editable-item'],
            styles['editable-item--editable'],
            isNew && styles['editable-item--new'],
            className,
          )}
          onSubmit={onFormSubmit}
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
            className={classNames(
              styles['editable-item__btn'],
              styles['editable-item__btn--confirm'],
            )}
            isSubmit
            isDisabled={isError || !currentItem}
          >
            Подтвердить
          </Button>
          <Button
            className={classNames(
              styles['editable-item__btn'],
              styles['editable-item__btn--cancel'],
            )}
            onClick={onCancelBtnClick}
          >
            Отмена
          </Button>
        </form>
        )
      }
    </React.Fragment>
  );
};
