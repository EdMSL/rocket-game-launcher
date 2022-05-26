import React, {
  useCallback, useEffect, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { DeveloperScreenController } from '$components/Developer/DeveloperScreenController';
import { useDeveloperSelector } from '$store/store';
import {
  IGameSettingsConfig, IGameSettingsFile, IGameSettingsOption,
} from '$types/gameSettings';
import {
  changeConfigArrayItem,
  generateGameSettingsOption,
  getChangedOptionsAfterFileDelete,
  getDefaultGameSettingsFile,
  getDefaultGameSettingsOption,
  getFullOption,
  getNewConfig,
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
import { EditableItem } from '$components/Developer/EditableItem';
import { HintItem } from '$components/HintItem';
import { GameSettingsFileItem } from '$components/Developer/GameSettingsFileItem';
import { GAME_DIR } from '$constants/paths';
import { CreateUserMessage } from '$utils/message';
import {
  addDeveloperMessages, saveGameSettingsConfig, updateConfig,
} from '$actions/developer';
import { GameSettingsOptionItem } from '$components/Developer/GameSettingsOptionItem';
import { SpoilerListItem } from '$components/Developer/SpoilerListItem';
import { ScrollbarsBlock } from '$components/UI/ScrollbarsBlock';
import {
  defaultFullGameSettingsOption,
} from '$constants/defaultData';
import {
  clearComponentValidationErrors,
  getUniqueValidationErrors,
  IValidationErrors,
  validateFileRelatedFields,
  ValidationErrorCause,
} from '$utils/validation';

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
  const [isSettingsInitialized, setIsSettingsInitialized] = useState<boolean>(isGameSettingsConfigLoaded);
  const [lastAddedGroupName, setLastAddedGroupName] = useState<string>('');
  const [lastAddedFileId, setLastAddedFileId] = useState<string>('');
  const [lastAddedOptionId, setLastAddedOptionId] = useState<string>('');
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
      isOpened: boolean,
    ) => {
      if (isOpened !== undefined && !isOpened) {
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

  const onSaveBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    saveSettingsChanges(currentTarget.name === 'ok_save_config_btn');
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

  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeCurrentConfig(target.value, target.name);
  }, [changeCurrentConfig]);

  const createNewGroup = useCallback(() => {
    const newName = getRandomName();

    changeCurrentConfig(
      [...currentConfig.gameSettingsGroups, {
        name: newName,
        label: '',
      }],
      'gameSettingsGroups',
    );

    setLastAddedGroupName(newName);
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

    if (lastAddedGroupName === name) {
      setLastAddedGroupName('');
    }
  }, [currentConfig, lastAddedGroupName, changeCurrentConfig]);

  const validateGroupLabel = useCallback((value: string, name: string) => {
    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      { [name]: [{ cause: ValidationErrorCause.EXISTS }] },
      currentConfig.gameSettingsGroups.map((group) => group.label).includes(value)
      && currentConfig.gameSettingsGroups.find((group) => group.name === name)?.label !== value,
    ));
  }, [currentConfig.gameSettingsGroups, validationErrors]);

  const deleteGroupItem = useCallback((name: string) => {
    const newGroups = currentConfig.gameSettingsGroups.filter((group) => group.name !== name);
    const newConfig = {
      ...currentConfig,
      gameSettingsGroups: newGroups,
      gameSettingsOptions: currentConfig.gameSettingsOptions.map((param) => {
        if (param.settingGroup === name) {
          return {
            ...param,
            settingGroup: newGroups[0].name,
          };
        }

        return param;
      }),
    };

    setLastAddedGroupName('');
    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
  }, [currentConfig, gameSettingsConfig]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, []);

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

        const file = getDefaultGameSettingsFile(
          getFileNameFromPathToFile(pathStr),
          pathWithVariable,
        );

        changeCurrentConfig([
          ...currentConfig.gameSettingsFiles,
          file,
        ],
        'gameSettingsFiles');
        setLastAddedFileId(file.id);
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

  const changeGameSettingsFiles = useCallback((
    fileId: string,
    fileData: IGameSettingsFile,
  ) => {
    const changedOptions = currentConfig.gameSettingsOptions.map((param) => {
      if (param.file === fileData.name) {
        return generateGameSettingsOption(
          param,
          getFullOption(defaultFullGameSettingsOption, param),
          fileData,
        ).newOption;
      }

      return param;
    });

    const newConfig = {
      ...currentConfig,
      gameSettingsFiles: changeConfigArrayItem(fileId, fileData, currentConfig.gameSettingsFiles),
      gameSettingsOptions: changedOptions,
    };

    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
  }, [currentConfig, gameSettingsConfig]);

  const deleteGameSettingsFile = useCallback((files: IGameSettingsFile[]) => {
    const newConfig = {
      ...currentConfig,
      gameSettingsFiles: files,
      gameSettingsOptions: getChangedOptionsAfterFileDelete(
        currentConfig.gameSettingsOptions,
        files,
      ),
    };

    setCurrentConfig(newConfig);
    setLastAddedFileId('');
    setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
  }, [currentConfig, gameSettingsConfig]);

  const deleteGameSettingsFileById = useCallback((id: string) => {
    const files = currentConfig.gameSettingsFiles.filter((item) => id !== item.id);

    deleteGameSettingsFile(files);
  }, [currentConfig.gameSettingsFiles, deleteGameSettingsFile]);

  const changeGameSettingsOptions = useCallback((
    optionId: string,
    optionData: IGameSettingsOption,
  ) => {
    changeCurrentConfig(
      changeConfigArrayItem(optionId, optionData, currentConfig.gameSettingsOptions),
      'gameSettingsOptions',
    );
  }, [currentConfig, changeCurrentConfig]);

  const addGameSettingsOption = useCallback(() => {
    const paramerter = getDefaultGameSettingsOption(currentConfig.gameSettingsFiles[0]);

    setNewValidationErrors(validateFileRelatedFields(
      paramerter,
      currentConfig.gameSettingsFiles[0],
      validationErrors,
    ));
    changeCurrentConfig([
      ...currentConfig.gameSettingsOptions,
      paramerter,
    ],
    'gameSettingsOptions');
    setLastAddedOptionId(paramerter.id);
  }, [currentConfig.gameSettingsOptions,
    currentConfig.gameSettingsFiles,
    validationErrors,
    setNewValidationErrors,
    changeCurrentConfig]);

  const deleteGameSettingsOption = useCallback((
    params: IGameSettingsOption[],
    deletedItemId: string,
  ) => {
    changeCurrentConfig(params, 'gameSettingsOptions');
    setValidationErrors(clearComponentValidationErrors(validationErrors, deletedItemId));
    setLastAddedOptionId('');
  }, [validationErrors, changeCurrentConfig]);

  const deleteGameSettingsOptionById = useCallback((id: string) => {
    changeCurrentConfig(
      currentConfig.gameSettingsOptions.filter((item) => id !== item.id),
      'gameSettingsOptions',
    );
    setLastAddedOptionId('');
  }, [currentConfig.gameSettingsOptions, changeCurrentConfig]);

  const changeGameSettingsOptionOrder = useCallback((params: IGameSettingsOption[]) => {
    changeCurrentConfig(params, 'gameSettingsOptions');
  }, [changeCurrentConfig]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className="developer__form">
      <DeveloperScreenController
        isConfigChanged={isConfigChanged}
        isHaveValidationErrors={Object.keys(validationErrors).length > 0}
        isFirstLaunch={isFirstLaunch}
        onSaveBtnClick={onSaveBtnClick}
        onCancelBtnClick={onCancelBtnClick}
        onResetBtnClick={onResetBtnClick}
        onUpdateBtnClick={onUpdateBtnClick}
      />
      <ScrollbarsBlock>
        {
          isGameSettingsConfigLoaded && (
            <React.Fragment>
              <div className="developer__block">
                <p className="developer__block-title">Группы игровых настроек</p>
                <Button
                  className={classNames('main-btn', 'developer__btn')}
                  isDisabled={!!lastAddedGroupName}
                  onClick={createNewGroup}
                >
                  Добавить
                </Button>
                <ul className={styles['developer__groups-container']}>
                  {
                  currentConfig.gameSettingsGroups.length > 0
                    && currentConfig.gameSettingsGroups.map((item) => (
                      <li
                        key={item.name}
                        className={classNames(
                          styles['developer__groups-item'],
                          lastAddedGroupName === item.name && styles['developer__groups-item--new'],
                        )}
                      >
                        {
                        lastAddedGroupName === item.name && (
                        <div className={styles['developer__group-label']}>
                          <span>Заголовок группы</span>
                          <HintItem description="Задать заголовок группы. Отображается как имя вкладки на экране игровых настроек." />
                        </div>
                        )
                      }
                        <EditableItem
                          id={item.name}
                          isError={!!validationErrors[item.name]}
                          isNew={lastAddedGroupName === item.name}
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
                    <li className={styles['developer__groups-item']}>
                      Нет групп игровых настроек
                    </li>
                  )
                }
                </ul>
              </div>
              <div className="developer__block">
                <p className="developer__block-title">Кодировка файлов настроек</p>
                <TextField
                  className="developer__item"
                  id="baseFilesEncoding"
                  name="baseFilesEncoding"
                  label="Кодировка"
                  value={currentConfig.baseFilesEncoding}
                  description="Кодировка, которая будет по умолчанию применяться при чтении и записи данных файлов игровых настроек." //eslint-disable-line max-len
                  placeholder={gameSettingsConfig.baseFilesEncoding}
                  onChange={onTextFieldChange}
                />
              </div>
              <div className="developer__block">
                <p className="developer__block-title">Настройка игровых опций</p>
                <p className="developer__subtitle">Файлы игровых настроек</p>
                <ul className={styles.developer__list}>
                  {
                  currentConfig.gameSettingsFiles.length > 0 && currentConfig.gameSettingsFiles.map((file, index) => (
                    <SpoilerListItem<IGameSettingsFile>
                      key={file.name}
                      item={file}
                      items={currentConfig.gameSettingsFiles}
                      position={index}
                      lastItemId={lastAddedFileId}
                      summaryText={[{ label: 'Имя файла:', text: file.label }, { label: 'Путь:', text: file.path }]}
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
                    </SpoilerListItem>
                  ))
                  }
                  {
                  currentConfig.gameSettingsFiles.length === 0
                  && <li> Нет игровых файлов </li>
                  }
                </ul>
                <Button
                  className={classNames('main-btn', 'developer__btn')}
                  onClick={onAddGameSettingsFile}
                >
                  Добавить
                </Button>
                <p className="developer__subtitle">Игровые опции</p>
                <ul className={styles.developer__list}>
                  {
                  currentConfig.gameSettingsOptions.length > 0 && currentConfig.gameSettingsOptions.map((currentOption, index) => (
                    <SpoilerListItem<IGameSettingsOption>
                      key={currentOption.id}
                      item={currentOption}
                      items={currentConfig.gameSettingsOptions}
                      position={index}
                      summaryText={[currentOption.label]}
                      lastItemId={lastAddedOptionId}
                      validationErrors={validationErrors}
                      onDeleteItem={deleteGameSettingsOption}
                      onChangeOrderItem={changeGameSettingsOptionOrder}
                    >
                      <GameSettingsOptionItem
                        option={currentOption}
                        gameSettingsFiles={currentConfig.gameSettingsFiles}
                        gameSettingsGroups={currentConfig.gameSettingsGroups}
                        validationErrors={validationErrors}
                        onOptionDataChange={changeGameSettingsOptions}
                        onValidation={setNewValidationErrors}
                        deleteOption={deleteGameSettingsOptionById}
                      />
                    </SpoilerListItem>
                  ))
                }
                  {
                  currentConfig.gameSettingsOptions.length === 0 && currentConfig.gameSettingsFiles.length !== 0
                  && <li> Нет игровых опций</li>
                  }
                  {
                  currentConfig.gameSettingsOptions.length === 0 && currentConfig.gameSettingsFiles.length === 0
                  && <li> Добавьте хотя бы один игровой файл, чтобы добавлять игровые опции</li>
                  }
                </ul>
                <Button
                  className={classNames('main-btn', 'developer__btn')}
                  onClick={addGameSettingsOption}
                >
                  Добавить
                </Button>
              </div>
            </React.Fragment>
          )
        }
      </ScrollbarsBlock>
    </div>
  );
};
