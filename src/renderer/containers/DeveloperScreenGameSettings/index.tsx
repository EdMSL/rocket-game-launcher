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
import { IGameSettingsConfig, IGameSettingsGroup } from '$types/gameSettings';
import { getNewConfig } from '$utils/data';
import { checkObjectForEqual } from '$utils/check';
import { saveGameSettingsConfig } from '$actions/main';
import { AppChannel } from '$constants/misc';
import { TextField } from '$components/UI/TextField';
import { GroupItem } from '$components/GroupItem';
import { Button } from '$components/UI/Button';
import { getRandomId } from '$utils/strings';

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
  const [lastCreatedGroupId, setLastCreatedGroupId] = useState<string>('');

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
    const newId = getRandomId('gs-group');

    changeCurrentConfig(
      [...currentSettingsConfig.gameSettingsGroups, {
        id: newId,
        name: 'Name',
        label: 'Заголовок',
      }],
      'gameSettingsGroups',
    );

    setLastCreatedGroupId(newId);
  }, [currentSettingsConfig, changeCurrentConfig]);

  const editGroupItem = useCallback((group: IGameSettingsGroup) => {
    changeCurrentConfig(
      currentSettingsConfig.gameSettingsGroups.map((currentGroup) => {
        if (currentGroup.id === group.id) {
          return group;
        }

        return currentGroup;
      }),
      'gameSettingsGroups',
    );

    if (lastCreatedGroupId === group.id) {
      setLastCreatedGroupId('');
    }
  }, [currentSettingsConfig, lastCreatedGroupId, changeCurrentConfig]);

  const deleteGroupItem = useCallback((id: string) => {
    changeCurrentConfig(
      currentSettingsConfig.gameSettingsGroups.filter((group) => group.id !== id),
      'gameSettingsGroups',
    );
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
    <form
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
              onClick={createNewGroup}
            >
              Добавить
            </Button>
            <ul className={styles['developer-screen__groups-container']}>
              {
              currentSettingsConfig.gameSettingsGroups.map((item) => (
                <GroupItem
                  key={item.id}
                  item={item}
                  isNew={lastCreatedGroupId === item.id}
                  groups={currentSettingsConfig.gameSettingsGroups}
                  editItem={editGroupItem}
                  deleteItem={deleteGroupItem}
                />
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
    </form>
  );
};
