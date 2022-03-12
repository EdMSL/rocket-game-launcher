import React, {
  ReactElement, useCallback, useEffect, useMemo, useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { DeveloperScreenController } from '$components/DeveloperScreenController';
import { IValidationErrors } from '$types/common';
import { useAppSelector } from '$store/store';
import { IGameSettingsConfig } from '$types/gameSettings';
import { getNewConfig, getUniqueValidationErrors } from '$utils/data';
import { checkObjectForEqual } from '$utils/check';
import { saveGameSettingsConfig } from '$actions/main';
import { AppChannel } from '$constants/misc';
import { TextField } from '$components/UI/TextField';
import { Button } from '$components/UI/Button';
import { getRandomName } from '$utils/strings';
import { EditableItem } from '$components/EditableItem';
import { HintItem } from '$components/HintItem';

export const DeveloperScreenGameSettings: React.FC = () => {
  const gameSettingsFiles = useAppSelector((state) => state.gameSettings.gameSettingsFiles);
  const gameSettingsGroups = useAppSelector((state) => state.gameSettings.gameSettingsGroups);
  const baseFilesEncoding = useAppSelector((state) => state.gameSettings.baseFilesEncoding);
  const isFirstLaunch = useAppSelector((state) => state.main.config.isFirstLaunch);

  const dispatch = useDispatch();

  const settingsConfig: IGameSettingsConfig = useMemo(() => ({
    gameSettingsGroups,
    baseFilesEncoding,
    gameSettingsFiles,
  }), [gameSettingsGroups, baseFilesEncoding, gameSettingsFiles]);

  const [currentSettingsConfig, setCurrentSettingsConfig] = useState<IGameSettingsConfig>(settingsConfig);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [lastCreatedGroupName, setLastCreatedGroupName] = useState<string>('');

  const saveSettingsChanges = useCallback((
    isGoToMainScreen: boolean,
  ) => {
    dispatch(saveGameSettingsConfig(
      currentSettingsConfig,
      isGoToMainScreen,
    ));

    setIsConfigChanged(false);
  }, [dispatch, currentSettingsConfig]);

  const resetConfigChanges = useCallback(() => {
    setIsConfigChanged(false);
    setValidationErrors({});
    setCurrentSettingsConfig(settingsConfig);
  }, [settingsConfig]);

  useEffect(() => {
    ipcRenderer.on(AppChannel.DEV_WINDOW_CLOSED, (event, isByCloseWindowBtnClick: boolean) => {
      if (isByCloseWindowBtnClick) {
        resetConfigChanges();
      }
    });

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.DEV_WINDOW_CLOSED); };
  }, [resetConfigChanges]);

  const changeCurrentConfig = useCallback((value, fieldName: string, parent?: string) => {
    const newConfig = getNewConfig(currentSettingsConfig, value, fieldName, parent);

    setCurrentSettingsConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(settingsConfig, newConfig));
  }, [settingsConfig, currentSettingsConfig]);

  const onSaveBtnClick = useCallback(() => {
    saveSettingsChanges(false);
  }, [saveSettingsChanges]);

  const onCancelBtnClick = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CLOSE_DEV_WINDOW);
  }, [resetConfigChanges]);

  const onResetBtnClick = useCallback(() => {
    resetConfigChanges();
  }, [resetConfigChanges]);

  const createNewGroup = useCallback(() => {
    const newName = getRandomName();

    changeCurrentConfig(
      [...currentSettingsConfig.gameSettingsGroups, {
        name: newName,
        label: '',
      }],
      'gameSettingsGroups',
    );

    setLastCreatedGroupName(newName);
  }, [currentSettingsConfig, changeCurrentConfig]);

  const editGroupItem = useCallback((value: string, name: string) => {
    changeCurrentConfig(
      currentSettingsConfig.gameSettingsGroups.map((currentGroup) => {
        if (currentGroup.name === name) {
          return {
            ...currentGroup,
            label: value,
          };
        }

        return currentGroup;
      }),
      'gameSettingsGroups',
    );

    if (lastCreatedGroupName === name) {
      setLastCreatedGroupName('');
    }
  }, [currentSettingsConfig, lastCreatedGroupName, changeCurrentConfig]);

  const validateGroupLabel = useCallback((value: string, name: string) => {
    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      { [name]: ['already exists'] },
      currentSettingsConfig.gameSettingsGroups.map((group) => group.label).includes(value)
      && currentSettingsConfig.gameSettingsGroups.find((group) => group.name === name)?.label !== value,
    ));
  }, [currentSettingsConfig.gameSettingsGroups, validationErrors]);

  const deleteGroupItem = useCallback((name: string) => {
    changeCurrentConfig(
      currentSettingsConfig.gameSettingsGroups.filter((group) => group.name !== name),
      'gameSettingsGroups',
    );

    setLastCreatedGroupName('');
  }, [currentSettingsConfig, changeCurrentConfig]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, []);

  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeCurrentConfig(target.value, target.id);
  }, [changeCurrentConfig]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div
      className="develover-screen__form"
    >
      <DeveloperScreenController
        isConfigChanged={isConfigChanged}
        isHaveValidationErrors={Object.keys(validationErrors).length > 0}
        isFirstLaunch={isFirstLaunch}
        onSaveBtnClick={onSaveBtnClick}
        onCancelBtnClick={onCancelBtnClick}
        onResetBtnClick={onResetBtnClick}
      />
      <Scrollbars
        autoHeight
        autoHide
        autoHeightMax="100%"
        hideTracksWhenNotNeeded
        renderTrackVertical={(props): ReactElement => (
          <div
            {...props}
            className="scrollbar__track"
          />
        )}
        renderThumbVertical={(props): ReactElement => (
          <div
            {...props}
            className="scrollbar__thumb"
          />
        )}
      >
        <div className={styles['developer-screen__game-settings']}>
          <div className="developer-screen__block">
            <p className="developer-screen__block-title">Группы игровых настроек</p>
            <Button
              className={classNames(
                'main-btn',
                'control-panel__btn',
                'developer-screen__btn',
              )}
              isDisabled={!!lastCreatedGroupName}
              onClick={createNewGroup}
            >
              Добавить
            </Button>
            <ul className={styles['developer-screen__groups-container']}>
              {
              currentSettingsConfig.gameSettingsGroups.map((item) => (
                <li
                  key={item.name}
                  className={classNames(
                    styles['developer-screen__groups-item'],
                    lastCreatedGroupName === item.name && styles['developer-screen__groups-item--new'],
                  )}
                >
                  {
                    lastCreatedGroupName === item.name && (
                    <p className={styles['developer-screen__group-label']}>
                      <span>Заголовок группы</span>
                      <HintItem description="Задать заголовок группы. Отображается как имя вкладки в экране игровых настроек." />
                    </p>
                    )
                  }
                  <EditableItem
                    id={item.name}
                    isError={!!validationErrors[item.name]}
                    isNew={lastCreatedGroupName === item.name}
                    item={item.label}
                    onApply={editGroupItem}
                    onDelete={deleteGroupItem}
                    onChange={validateGroupLabel}
                  />
                </li>
              ))
            }
            </ul>
          </div>
        </div>
        <div className="developer-screen__block">
          <p className="developer-screen__block-title">Кодировка файлов настроек</p>
          <TextField
            className="developer-screen__item"
            id="baseFilesEncoding"
            label="Кодировка"
            value={currentSettingsConfig.baseFilesEncoding}
            description="Кодировка, которая будет по умолчанию применяться при чтении данных из файлов игровых настроек." //eslint-disable-line max-len
            onChange={onTextFieldChange}
          />
        </div>
      </Scrollbars>
    </div>
  );
};
