import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IGameSettingsGroup } from '$types/gameSettings';
import { Button } from '$components/UI/Button';
import { HintItem } from '$components/HintItem';
import { IValidationErrors } from '$types/common';
import { getUniqueValidationErrors } from '$utils/data';

interface IProps {
  item: IGameSettingsGroup,
  groups: IGameSettingsGroup[],
  isNew: boolean,
  validationErrors: IValidationErrors,
  editItem: (group: IGameSettingsGroup) => void,
  deleteItem: (id: string) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const GroupItem: React.FC<IProps> = ({
  item,
  isNew,
  groups,
  validationErrors,
  editItem,
  deleteItem,
  onValidationError,
}) => {
  const nameInput = useRef<HTMLInputElement>(null);
  const labelInput = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState<boolean>(isNew);
  const [editableGroup, setEditableGroup] = useState<IGameSettingsGroup>(item);

  const onEnterKeyPress = useCallback((event: KeyboardEvent) => {
    if (isEditMode && event.code === 'Enter' && editableGroup.name && !validationErrors[item.id]) {
      editItem(editableGroup);
      setIsEditMode(false);
    }
  }, [isEditMode, editableGroup, validationErrors, item.id, editItem]);

  const onEscKeyPress = useCallback((event: KeyboardEvent) => {
    if (isEditMode && event.code === 'Escape') {
      if (isNew) {
        deleteItem(item.id);
      } else {
        setIsEditMode(false);
        setEditableGroup(item);
      }
    }
  }, [isNew, item, isEditMode, deleteItem]);

  useEffect(() => {
    const input = nameInput.current;
    const label = labelInput.current;

    input?.addEventListener('keyup', onEnterKeyPress);
    label?.addEventListener('keyup', onEnterKeyPress);
    input?.addEventListener('keyup', onEscKeyPress);
    label?.addEventListener('keyup', onEscKeyPress);

    return (): void => {
      input?.removeEventListener('keyup', onEnterKeyPress);
      label?.removeEventListener('keyup', onEnterKeyPress);
      input?.removeEventListener('keyup', onEscKeyPress);
      label?.removeEventListener('keyup', onEscKeyPress);
    };
  }, [onEnterKeyPress, onEscKeyPress]);

  const onGroupInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let errors: IValidationErrors = { ...validationErrors };
    setEditableGroup({
      ...editableGroup,
      name: target.name === 'name' ? target.value.toLowerCase() : editableGroup.name,
      label: target.name === 'label' ? target.value : editableGroup.label,
    });

    if (target.name === 'name') {
      errors = getUniqueValidationErrors(
        errors,
        { [item.id]: ['alphanum'] },
        !/^[a-z0-9]*$/.test(target.value.toLowerCase()),
      );

      errors = getUniqueValidationErrors(
        errors,
        { [item.id]: ['already exists'] },
        groups.map((group) => group.name).includes(target.value.toLowerCase())
        && item.name !== target.value.toLowerCase(),
      );
    }

    onValidationError(errors);
  }, [item.id, item.name, editableGroup, groups, validationErrors, onValidationError]);

  const onEditBtnClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const onDeleteBtnClick = useCallback(() => {
    deleteItem(item.id);
  }, [deleteItem, item.id]);

  const onConfirmBtnClick = useCallback(() => {
    editItem(editableGroup);
    setIsEditMode(false);
  }, [editableGroup, editItem]);

  const onCancelBtnClick = useCallback(() => {
    if (isNew) {
      deleteItem(item.id);
    } else {
      setIsEditMode(false);
      setEditableGroup(item);
    }
  }, [isNew, item, deleteItem]);

  return (
    <li className={classNames(
      styles.group__item,
      isEditMode && styles['group__item--editable'],
      isNew && styles['group__item--new'],
    )}
    >
      {
        !isEditMode && (
          <React.Fragment>
            <p className={styles.group__text}>{item.name}</p>
            <p className={styles.group__text}>{item.label}</p>
          </React.Fragment>
        )
      }
      {
        isEditMode && (
          <React.Fragment>
            <label
              className={styles.group__label}
              htmlFor={`input-name-${item.id}`}
            >
              <span>Имя группы</span>
              <HintItem
                description="Задать имя группы. Только цифры и латинские буквы. Используется для служебных целей."
              />
            </label>
            <input
              ref={nameInput}
              className={classNames(
                styles.group__input,
                validationErrors[item.id] && styles['group__input--error'],
              )}
              id={`input-name-${item.id}`}
              name="name"
              value={editableGroup.name}
              autoFocus
              onChange={onGroupInputChange}
            />
            <label
              className={styles.group__label}
              htmlFor={`input-label-${item.id}`}
            >
              <span>Заголовок группы</span>
              <HintItem
                description="Задать заголовок группы. Отображается как имя вкладки в экране игровых настроек."
              />
            </label>
            <input
              ref={labelInput}
              className={styles.group__input}
              id={`input-label-${item.id}`}
              name="label"
              value={editableGroup.label}
              onChange={onGroupInputChange}
            />
          </React.Fragment>
        )
      }
      {
        !isEditMode && (
          <Button
            className={classNames(styles.group__btn, styles['group__btn--edit'])}
            onClick={onEditBtnClick}
          >
            Редактировать
          </Button>
        )
      }
      {
        !isEditMode && (
          <Button
            className={classNames(styles.group__btn, styles['group__btn--delete'])}
            onClick={onDeleteBtnClick}
          >
            Удалить
          </Button>
        )
      }
      {
        isEditMode && (
          <Button
            className={classNames(styles.group__btn, styles['group__btn--confirm'])}
            onClick={onConfirmBtnClick}
            isDisabled={!!validationErrors[item.id]}
          >
            Подтвердить
          </Button>
        )
      }
      {
        isEditMode && (
          <Button
            className={classNames(styles.group__btn, styles['group__btn--cancel'])}
            onClick={onCancelBtnClick}
          >
            Отмена
          </Button>
        )
      }
    </li>
  );
};
