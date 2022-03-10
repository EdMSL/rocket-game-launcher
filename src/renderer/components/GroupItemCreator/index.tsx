import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import styles from './styles.module.scss';
import { HintItem } from '$components/HintItem';
import { emptyGameSettingsGroup, TEXT_INPUT_MAX_LENGTH } from '$constants/defaultParameters';
import { Button } from '$components/UI/Button';
import { IValidationErrors } from '$types/common';
import { IGameSettingsGroup } from '$types/gameSettings';
import { getUniqueValidationErrors } from '$utils/data';
import { AppChannel } from '$constants/misc';
import { getRandomId } from '$utils/strings';

interface IProps {
  className: string,
  validationErrors: IValidationErrors,
  onApplyNewName: (group: IGameSettingsGroup) => void,
  onValidationError: (data: IValidationErrors) => void,
}

export const GroupItemCreator: React.FunctionComponent<IProps> = ({
  className = '',
  validationErrors,
  onApplyNewName,
  onValidationError,
}) => {
  const nameInput = useRef<HTMLInputElement>(null);
  const labelInput = useRef<HTMLInputElement>(null);

  const [newGroup, setNewGroup] = useState<IGameSettingsGroup>(emptyGameSettingsGroup);

  const createGroup = useCallback(() => {
    onApplyNewName({
      ...newGroup,
      id: getRandomId('gs-group'),
      label: newGroup.label ? newGroup.label : newGroup.name,
    });

    setNewGroup(emptyGameSettingsGroup);
    nameInput.current?.focus();
  }, [newGroup, onApplyNewName]);

  const onEnterKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Enter' && newGroup.name && !validationErrors['group-creator-name']) {
      createGroup();
    }
  }, [newGroup.name, validationErrors, createGroup]);

  useEffect(() => {
    const input = nameInput.current;
    const label = labelInput.current;

    input?.addEventListener('keyup', onEnterKeyPress);
    label?.addEventListener('keyup', onEnterKeyPress);

    ipcRenderer.on(AppChannel.DEV_WINDOW_CLOSED, (event, isByCloseWindowBtnClick: boolean) => {
      if (isByCloseWindowBtnClick) {
        setNewGroup(emptyGameSettingsGroup);
      }
    });

    return (): void => {
      input?.removeEventListener('keyup', onEnterKeyPress);
      label?.removeEventListener('keyup', onEnterKeyPress);
      ipcRenderer.removeAllListeners(AppChannel.DEV_WINDOW_CLOSED);
    };
  }, [onEnterKeyPress]);

  const onApplyBtnClick = useCallback(() => {
    createGroup();
  }, [createGroup]);

  const onTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.id === 'group-creator-name') {
      setNewGroup({ ...newGroup, name: target.value });

      onValidationError(getUniqueValidationErrors(
        validationErrors,
        { 'group-creator-name': ['alphanum'] },
        !/^[a-zA-Z0-9]*$/.test(target.value),
      ));
    } else {
      setNewGroup({ ...newGroup, label: target.value });
    }
  }, [newGroup, validationErrors, onValidationError]);

  return (
    <div className={classNames(
      styles['group-item-creator__container'],
      className,
    )}
    >
      <div className={styles['group-item-creator__labels-block']}>
        <label
          className={styles['group-item-creator__label']}
          htmlFor="group-creator-name"
        >
          <span>Имя группы</span>
          <HintItem
            description="Задать имя группы. Только цифры и латинские буквы. Используется для служебных целей."
          />
        </label>
        <label
          className={styles['group-item-creator__label']}
          htmlFor="group-creator-label"
        >
          <span>Заголовок группы</span>
          <HintItem
            description="Задать заголовок группы. Отображается как имя вкладки в экране игровых настроек."
          />
        </label>
      </div>
      <div className={styles['group-item-creator__inputs-container']}>
        <div className={styles['group-item-creator__inputs-block']}>
          <input
            className={classNames(
              styles['group-item-creator__input'],
              validationErrors['group-creator-name']?.length > 0
                && styles['group-item-creator__input--error'],
            )}
            ref={nameInput}
            type="text"
            id="group-creator-name"
            value={newGroup.name}
            maxLength={TEXT_INPUT_MAX_LENGTH}
            onChange={onTextFieldChange}
          />
          <input
            className={styles['group-item-creator__input']}
            ref={labelInput}
            type="text"
            id="group-creator-label"
            value={newGroup.label}
            maxLength={TEXT_INPUT_MAX_LENGTH}
            placeholder={newGroup.name}
            onChange={onTextFieldChange}
          />

        </div>
        <Button
          className={styles['group-item-creator__input-btn']}
          isDisabled={!newGroup.name || !!validationErrors['group-creator-name']}
          onClick={onApplyBtnClick}
        >
          Принять
        </Button>
      </div>
    </div>
  );
};
