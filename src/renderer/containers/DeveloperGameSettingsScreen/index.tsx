import React, {
  ReactElement, useCallback, useEffect, useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { DeveloperScreenController } from '$components/DeveloperScreenController';
import { IValidationErrors } from '$types/common';
import { useDeveloperSelector } from '$store/store';
import {
  IGameSettingsConfig, IGameSettingsFile, IGameSettingsParameter,
} from '$types/gameSettings';
import {
  getDefaultGameSettingsFile,
  getDefaultGameSettingsParameter,
  getNewConfig,
  getUniqueValidationErrors,
} from '$utils/data';
import { checkObjectForEqual } from '$utils/check';
import {
  AppChannel, gameSettingsFileAvailableVariables, LauncherButtonAction,
} from '$constants/misc';
import { TextField } from '$components/UI/TextField';
import { Button } from '$components/UI/Button';
import {
  checkIsPathIsNotOutsideValidFolder,
  getFileNameFromPathToFile,
  getRandomName,
  replaceRootDirByPathVariable,
} from '$utils/strings';
import { EditableItem } from '$components/EditableItem';
import { HintItem } from '$components/HintItem';
import { GameSettingsFileItem } from '$components/GameSettingsFileItem';
import { GAME_DIR } from '$constants/paths';
import { CreateUserMessage } from '$utils/message';
import {
  addDeveloperMessages, saveGameSettingsConfig, updateConfig,
} from '$actions/developer';
import { GameSettingsParameterItem } from '$components/GameSettingsParameterItem';
import { SpoilerItem } from '$components/SpoilerItem';

export const DeveloperGameSettingsScreen: React.FC = () => {
  /* eslint-disable max-len */
  const gameSettingsConfig = useDeveloperSelector((state) => state.developer.gameSettingsConfig);
  const isGameSettingsConfigProcessing = useDeveloperSelector((state) => state.developer.isGameSettingsConfigProcessing);
  const isGameSettingsConfigLoaded = useDeveloperSelector((state) => state.developer.isGameSettingsConfigLoaded);
  const isFirstLaunch = useDeveloperSelector((state) => state.developer.launcherConfig.isFirstLaunch);
  const pathVariables = useDeveloperSelector((state) => state.developer.pathVariables);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IGameSettingsConfig>(gameSettingsConfig);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [lastCreatedGroupName, setLastCreatedGroupName] = useState<string>('');
  const [isSettingsInitialized, setIsSettingsInitialized] = useState<boolean>(isGameSettingsConfigLoaded);
  /* eslint-enable max-len */

  const getPathFromPathSelector = useCallback(async (
  ): Promise<string> => ipcRenderer.invoke(
    AppChannel.GET_PATH_BY_PATH_SELECTOR,
    LauncherButtonAction.RUN,
    GAME_DIR,
  ), []);

  const saveSettingsChanges = useCallback((
    isGoToMainScreen: boolean,
  ) => {
    dispatch(saveGameSettingsConfig(
      currentConfig,
      isGoToMainScreen,
    ));

    setIsConfigChanged(false);
  }, [dispatch, currentConfig]);

  const resetConfigChanges = useCallback(() => {
    setIsConfigChanged(false);
    setValidationErrors({});
    setCurrentConfig(gameSettingsConfig);
  }, [gameSettingsConfig]);

  useEffect(() => {
    ipcRenderer.on(AppChannel.CHANGE_DEV_WINDOW_STATE, (
      event,
      isOpen: boolean,
      isByCloseWindowBtnClick: boolean,
    ) => {
      if (
        isOpen !== undefined
        && isByCloseWindowBtnClick !== undefined
        && !isOpen
        && isByCloseWindowBtnClick
      ) {
        resetConfigChanges();
      }
    });

    if (!isSettingsInitialized && !isGameSettingsConfigProcessing) {
      resetConfigChanges();
      setIsSettingsInitialized(true);
    }

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.CHANGE_DEV_WINDOW_STATE); };
  }, [isSettingsInitialized, isGameSettingsConfigProcessing, resetConfigChanges]);

  const changeCurrentConfig = useCallback((value, fieldName: string, parent?: string) => {
    const newConfig = getNewConfig(currentConfig, value, fieldName, parent);

    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
  }, [gameSettingsConfig, currentConfig]);

  const changeGameSettingsFiles = useCallback((
    fileId: string,
    fileData: IGameSettingsFile,
  ) => {
    const fileIndex = currentConfig.gameSettingsFiles.findIndex((currFile) => currFile.name === fileId);
    const newFiles = [...currentConfig.gameSettingsFiles];

    newFiles[fileIndex] = { ...fileData };

    changeCurrentConfig(newFiles, 'gameSettingsFiles');
  }, [currentConfig, changeCurrentConfig]);

  const onSaveBtnClick = useCallback(() => {
    saveSettingsChanges(false);
  }, [saveSettingsChanges]);

  const onCancelBtnClick = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
  }, [resetConfigChanges]);

  const onResetBtnClick = useCallback(() => {
    resetConfigChanges();
  }, [resetConfigChanges]);

  const onUpdateBtnClick = useCallback(() => {
    dispatch(updateConfig('gameSettings'));
    setIsSettingsInitialized(false);
  }, [dispatch]);

  const createNewGroup = useCallback(() => {
    const newName = getRandomName();

    changeCurrentConfig(
      [...currentConfig.gameSettingsGroups, {
        name: newName,
        label: '',
      }],
      'gameSettingsGroups',
    );

    setLastCreatedGroupName(newName);
  }, [currentConfig, changeCurrentConfig]);

  const editGroupItem = useCallback((value: string, name: string) => {
    changeCurrentConfig(
      currentConfig.gameSettingsGroups.map((currentGroup) => {
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
  }, [currentConfig, lastCreatedGroupName, changeCurrentConfig]);

  const validateGroupLabel = useCallback((value: string, name: string) => {
    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      { [name]: ['already exists'] },
      currentConfig.gameSettingsGroups.map((group) => group.label).includes(value)
      && currentConfig.gameSettingsGroups.find((group) => group.name === name)?.label !== value,
    ));
  }, [currentConfig.gameSettingsGroups, validationErrors]);

  const deleteGroupItem = useCallback((name: string) => {
    changeCurrentConfig(
      currentConfig.gameSettingsGroups.filter((group) => group.name !== name),
      'gameSettingsGroups',
    );

    setLastCreatedGroupName('');
  }, [currentConfig, changeCurrentConfig]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, []);

  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeCurrentConfig(target.value, target.id);
  }, [changeCurrentConfig]);

  const onAddGameSettingsFile = useCallback(async () => {
    const pathStr = await getPathFromPathSelector();

    if (pathStr !== '') {
      try {
        checkIsPathIsNotOutsideValidFolder(pathStr, pathVariables);

        const pathWithVariable = replaceRootDirByPathVariable(
          pathStr,
          gameSettingsFileAvailableVariables,
          pathVariables,
        );

        changeCurrentConfig([
          ...currentConfig.gameSettingsFiles,
          getDefaultGameSettingsFile(
            getFileNameFromPathToFile(pathStr),
            pathWithVariable,
          ),
        ],
        'gameSettingsFiles');
      } catch (error: any) {
        dispatch(addDeveloperMessages([CreateUserMessage.error(
          'Выбранный файл находится в недопустимой папке.',
        )]));
      }
    }
  }, [pathVariables,
    currentConfig.gameSettingsFiles,
    dispatch,
    changeCurrentConfig,
    getPathFromPathSelector]);

  const onAddGameSettingsParameter = useCallback(() => {
    changeCurrentConfig([
      ...currentConfig.gameSettingsFiles,
      getDefaultGameSettingsParameter(currentConfig.gameSettingsFiles),
    ],
    'gameSettingsFiles');
  }, [currentConfig.gameSettingsFiles, changeCurrentConfig]);

  const deleteGameSettingsFile = useCallback((items: IGameSettingsFile[]) => {
    changeCurrentConfig(items, 'gameSettingsFiles');
  }, [changeCurrentConfig]);

  const deleteGameSettingsFileById = useCallback((id: string) => {
    changeCurrentConfig(currentConfig.gameSettingsFiles.filter((item) => id !== item.id), 'gameSettingsFiles');
  }, [currentConfig.gameSettingsFiles, changeCurrentConfig]);

  const deleteGameSettingsParameter = useCallback((params: IGameSettingsParameter[]) => {
    changeCurrentConfig(params, 'gameSettingsParameters');
  }, [changeCurrentConfig]);

  const changeGameSettingsParameterOrder = useCallback((params: IGameSettingsParameter[]) => {
    changeCurrentConfig(params, 'gameSettingsParameters');
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
        onUpdateBtnClick={onUpdateBtnClick}
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
        {
          isGameSettingsConfigLoaded && (
          <React.Fragment>
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
                  currentConfig.gameSettingsGroups.length > 0
                    && currentConfig.gameSettingsGroups.map((item) => (
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
                          <HintItem description="Задать заголовок группы. Отображается как имя вкладки на экране игровых настроек." />
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
                  {
                  currentConfig.gameSettingsGroups.length === 0 && (
                    <li className={styles['developer-screen__groups-item']}>
                      Нет групп игровых настроек
                    </li>
                  )
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
                value={currentConfig.baseFilesEncoding}
                description="Кодировка, которая будет по умолчанию применяться при чтении и записи данных файлов игровых настроек." //eslint-disable-line max-len
                onChange={onTextFieldChange}
              />
            </div>
            <div className="developer-screen__block">
              <p className="developer-screen__block-title">Настройка игровых опций</p>
              <p className="developer-screen__text">Файлы игровых параметров</p>
              <ul className={styles['developer-screen__list']}>
                {
                currentConfig.gameSettingsFiles.length > 0 && currentConfig.gameSettingsFiles.map((file, index) => (
                  <SpoilerItem<IGameSettingsFile>
                    key={file.name}
                    item={file}
                    items={currentConfig.gameSettingsFiles}
                    position={index}
                    summaryText={[{ label: 'Имя файла:', text: file.name }, { label: 'Путь:', text: file.path }]}
                    validationErrors={validationErrors}
                    onDeleteItem={deleteGameSettingsFile}
                  >
                    <GameSettingsFileItem
                      file={file}
                      pathVariables={pathVariables}
                      validationErrors={validationErrors}
                      onFileDataChange={changeGameSettingsFiles}
                      onValidation={setNewValidationErrors}
                      deleteFile={deleteGameSettingsFileById}
                    />
                  </SpoilerItem>
                ))
                }
                {
                currentConfig.gameSettingsFiles.length === 0
                && <li> Нет игровых файлов </li>
                }
              </ul>
              <Button
                className={classNames(
                  'main-btn',
                  'control-panel__btn',
                  'developer-screen__btn',
                )}
                onClick={onAddGameSettingsFile}
              >
                Добавить файл
              </Button>
              <p className="developer-screen__text">Игровые параметры</p>
              <Button
                className={classNames(
                  'main-btn',
                  'control-panel__btn',
                  'developer-screen__btn',
                )}
                onClick={onAddGameSettingsParameter}
              >
                Добавить параметр
              </Button>
              <ul className={styles['developer-screen__list']}>
                {
                currentConfig.gameSettingsParameters.length > 0 && currentConfig.gameSettingsParameters.map((param, index) => (
                  <SpoilerItem<IGameSettingsParameter>
                    key={param.id}
                    item={param}
                    items={currentConfig.gameSettingsParameters}
                    position={index}
                    summaryText={[param.label]}
                    validationErrors={validationErrors}
                    onDeleteItem={deleteGameSettingsParameter}
                    onChangeOrderItem={changeGameSettingsParameterOrder}
                  >
                    <GameSettingsParameterItem
                      parameter={param}
                      validationErrors={validationErrors}
                      onValidation={setNewValidationErrors}
                    />
                  </SpoilerItem>
                ))
                }
                {
                currentConfig.gameSettingsParameters.length === 0
                && <li> Нет игровых параметров</li>
                }
              </ul>
            </div>
          </React.Fragment>
          )
        }
      </Scrollbars>
    </div>
  );
};
