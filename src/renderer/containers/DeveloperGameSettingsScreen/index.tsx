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
  generateSelectOptions,
  getChangedOptionsAfterFileDelete,
  getDefaultGameSettingsFile,
  getDefaultGameSettingsOption,
  getFullOption,
  getGameSettingsFilesNames,
  getNewConfig,
} from '$utils/data';
import { checkObjectForEqual } from '$utils/check';
import {
  AppChannel,
  AppWindowName,
  gameSettingsFileAvailableVariablesAll,
  LauncherButtonAction,
  PathRegExp,
  PathVariableName,
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
  addDeveloperMessages, createGameSettingsConfigFile, saveGameSettingsConfig, updateConfig,
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
  IValidationData,
  IValidationErrors,
  validateFileRelatedFields,
  ValidationErrorCause,
} from '$utils/validation';
import { Switcher } from '$components/UI/Switcher';
import { Select } from '$components/UI/Select';
import { PathSelector } from '$components/UI/PathSelector';

export const DeveloperGameSettingsScreen: React.FC = () => {
  /* eslint-disable max-len */
  const isGameSettingsConfigFileExists = useDeveloperSelector((state) => state.developer.isGameSettingsConfigFileExists);
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

  const onSelectChange = useCallback(({ target }: React.ChangeEvent<HTMLSelectElement>) => {
    changeCurrentConfig(target.value, target.name, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSwitcherChange = useCallback(async ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (
      target.id === 'isUsed'
      && !target.checked
      && currentConfig.gameSettingsFiles.length > 0
      && currentConfig.gameSettingsFiles.some(
        (currentFile) => PathRegExp.MO.test(currentFile.path),
      )
    ) {
      const messageBoxResponse = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        `В путях к некоторым файлам игровых настроек пристуствуют переменные Mod Organizer.\nНажмите "Отмена", чтобы вручную изменить пути к файлам, "Игнорировать", чтобы изменить переменную на ${PathVariableName.GAME_DIR}, или "Удалить", чтобы удалить файлы и связанные с ними игровые опции.\nИзменения будут приняты только при сохранении текущей конфигурации.`, //eslint-disable-line max-len
        'Выберите действие',
        undefined,
        ['Отмена', 'Игнорировать', 'Удалить'],
        AppWindowName.DEV,
      );

      if (messageBoxResponse.response > 0) {
        const changedFileNames: string[] = [];

        let newConfig: IGameSettingsConfig = { ...currentConfig };
        let message = '';

        if (messageBoxResponse.response === 1) {
          const newFiles = currentConfig.gameSettingsFiles.map((currentFile) => {
            if (PathRegExp.MO.test(currentFile.path)) {
              changedFileNames.push(currentFile.label);

              return {
                ...currentFile,
                path: currentFile.path.replace(PathRegExp.MO, PathVariableName.GAME_DIR),
              };
            }

            return currentFile;
          });

          newConfig = {
            ...newConfig,
            gameSettingsFiles: newFiles,
            modOrganizer: {
              ...newConfig.modOrganizer,
              isUsed: false,
            },
          };

          message = `При сохранении настроек для файлов [${changedFileNames.join()}] переменная пути будет изменена на ${PathVariableName.GAME_DIR}`; //eslint-disable-line max-len
        } else if (messageBoxResponse.response === 2) {
          const changedOptionsNames: string[] = [];

          const newFiles = newConfig.gameSettingsFiles.filter(
            (currentFile) => {
              if (PathRegExp.MO.test(currentFile.path)) {
                changedFileNames.push(currentFile.label);

                return false;
              }

              return true;
            },
          );
          const filesNames = getGameSettingsFilesNames(newFiles);

          newConfig = {
            ...newConfig,
            gameSettingsFiles: newFiles,
            gameSettingsOptions: newConfig.gameSettingsOptions.filter(
              (currentOption) => {
                if (!filesNames.includes(currentOption.file)) {
                  changedOptionsNames.push(currentOption.label);

                  return false;
                }

                return true;
              },
            ),
            modOrganizer: {
              ...newConfig.modOrganizer,
              isUsed: false,
            },
          };

          message = `При сохранении настроек файлы [${changedFileNames.join()}]${changedOptionsNames.length > 0 ? ` и опции [${changedOptionsNames.join()}]` : ''} будут удалены`; //eslint-disable-line max-len
        }

        dispatch(addDeveloperMessages([CreateUserMessage.info(message)]));

        setCurrentConfig(newConfig);
        setIsConfigChanged(!checkObjectForEqual(currentConfig, newConfig));
      }
    } else {
      changeCurrentConfig(target.checked, target.name, target.dataset.parent);
    }
  }, [currentConfig,
    changeCurrentConfig,
    dispatch]);

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
    parent: string|undefined,
  ) => {
    let pathStr = value;

    if (pathStr === '') {
      if (parent) {
        pathStr = currentConfig[parent][id];
      } else {
        pathStr = currentConfig[id];
      }
    }

    changeCurrentConfig(
      pathStr,
      id,
      parent,
    );

    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      validationData.errors,
      validationData.isForAdd,
    ));
  }, [currentConfig, validationErrors, changeCurrentConfig]);

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

  const deleteGroupItem = useCallback((deletedGroupName: string) => {
    const changedOptions: string[] = [];
    const newGroups = currentConfig.gameSettingsGroups.filter(
      (group) => group.name !== deletedGroupName,
    );
    const newConfig = {
      ...currentConfig,
      gameSettingsGroups: newGroups,
      gameSettingsOptions: currentConfig.gameSettingsOptions.map((option) => {
        if (option.settingGroup === deletedGroupName) {
          changedOptions.push(option.label);

          return {
            ...option,
            settingGroup: newGroups[0].name,
          };
        }

        return option;
      }),
    };

    if (changedOptions.length > 0) {
      dispatch(addDeveloperMessages([CreateUserMessage.info(`Для опций ${changedOptions.join()} была установлена группа настроек "${newGroups[0].label}"`)])); //eslint-disable-line max-len
    }

    setLastAddedGroupName('');
    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
  }, [currentConfig, gameSettingsConfig, dispatch]);

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
          gameSettingsFileAvailableVariablesAll,
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
      } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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

  const deleteGameSettingsFile = useCallback(async (
    newFiles: IGameSettingsFile[],
    deletedItem: IGameSettingsFile|undefined,
  ) => {
    if (
      currentConfig.gameSettingsFiles.length === 1
      && currentConfig.gameSettingsOptions.length > 0
    ) {
      await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        'Невозможно удалить единственный файл, если присутствует хотя бы одна игровая опция.', //eslint-disable-line max-len
        'Выберите действие',
        undefined,
        undefined,
        AppWindowName.DEV,
      );
    } else if (currentConfig.gameSettingsOptions.some(
      (currentOption) => currentOption.file === deletedItem?.name,
    )
    ) {
      const messageBoxResponse = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        'Одна или несколько игровых опций имеют данный файл в зависимостях. Нажмите "Отмена", чтобы вручную изменить используемый опциями файл, "Игнорировать", чтобы автоматически выбрать для опции один из доступных файлов, или "Удалить", чтобы удалить связанные с файлом опции.', //eslint-disable-line max-len
        'Выберите действие',
        undefined,
        ['Отмена', 'Игнорировать', 'Удалить'],
        AppWindowName.DEV,
      );

      if (messageBoxResponse.response > 0) {
        const [newOptions, changedOptionsNames] = getChangedOptionsAfterFileDelete(
          currentConfig.gameSettingsOptions,
          newFiles,
          messageBoxResponse.response === 2,
        );

        const newConfig = {
          ...currentConfig,
          gameSettingsFiles: newFiles,
          gameSettingsOptions: newOptions,
        };

        if (changedOptionsNames.length > 0) {
          if (messageBoxResponse.response === 1) {
            dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек для опций [${changedOptionsNames.join()}] используемый файл будет изменен на "${newFiles[0].label}"`)])); //eslint-disable-line max-len
          } else {
            dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек опции [${changedOptionsNames.join()}] будут удалены`)])); //eslint-disable-line max-len
          }
        }

        let currentValidationErrors = { ...validationErrors };

        newConfig.gameSettingsOptions.forEach((currentOption) => {
          currentValidationErrors = {
            ...currentValidationErrors,
            ...validateFileRelatedFields(
              currentOption,
              newFiles[0],
              validationErrors,
            ),
          };

          setNewValidationErrors(currentValidationErrors);
        });

        setCurrentConfig(newConfig);
        setLastAddedFileId('');
        setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
      }
    } else {
      const newConfig = {
        ...currentConfig,
        gameSettingsFiles: newFiles,
      };

      setCurrentConfig(newConfig);
      setLastAddedFileId('');
      setIsConfigChanged(!checkObjectForEqual(gameSettingsConfig, newConfig));
    }
  }, [currentConfig, gameSettingsConfig, validationErrors, setNewValidationErrors, dispatch]);

  const deleteGameSettingsFileById = useCallback((id: string) => {
    let deletedFile: IGameSettingsFile|undefined;
    const files = currentConfig.gameSettingsFiles.filter((item) => {
      if (id !== item.id) {
        deletedFile = item;

        return true;
      }

      return false;
    });

    deleteGameSettingsFile(files, deletedFile);
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
    const newOption = getDefaultGameSettingsOption(
      currentConfig.gameSettingsFiles[0],
      currentConfig.gameSettingsGroups[0].name,
    );

    setNewValidationErrors(validateFileRelatedFields(
      newOption,
      currentConfig.gameSettingsFiles[0],
      validationErrors,
    ));
    changeCurrentConfig([
      ...currentConfig.gameSettingsOptions,
      newOption,
    ],
    'gameSettingsOptions');
    setLastAddedOptionId(newOption.id);
  }, [currentConfig.gameSettingsOptions,
    currentConfig.gameSettingsFiles,
    currentConfig.gameSettingsGroups,
    validationErrors,
    setNewValidationErrors,
    changeCurrentConfig]);

  const deleteGameSettingsOption = useCallback((
    params: IGameSettingsOption[],
    deletedItem: IGameSettingsOption,
  ) => {
    changeCurrentConfig(params, 'gameSettingsOptions');
    setValidationErrors(clearComponentValidationErrors(validationErrors, deletedItem.id));
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

  const addGameSettingsConfigFile = useCallback(() => {
    dispatch(createGameSettingsConfigFile());
  }, [dispatch]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className="developer__form">
      {
        isGameSettingsConfigFileExists && (
          <React.Fragment>
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
                      <p className="developer__block-title">Настройки Mod Organizer</p>
                      <Switcher
                        className="developer__item"
                        id="isUsed"
                        name="isUsed"
                        parent="modOrganizer"
                        label="Используется ли MO?"
                        isChecked={currentConfig.modOrganizer.isUsed}
                        description="Определяет, используется ли в игре\сборке Mod Organizer"//eslint-disable-line max-len
                        onChange={onSwitcherChange}
                      />
                      <Select
                        className="developer__item"
                        id="version"
                        name="version"
                        parent="modOrganizer"
                        label="Версия MO"
                        selectOptions={[
                          { label: 'Mod Organizer', value: '1' },
                          { label: 'Mod Organizer 2', value: '2' },
                        ]}
                        value={currentConfig.modOrganizer.version.toString()}
                        isDisabled={!currentConfig.modOrganizer.isUsed}
                        description="Задает версию использемого Mod Organizer"
                        onChange={onSelectChange}
                      />
                      <PathSelector
                        className="developer__item"
                        id="pathToMOFolder"
                        name="pathToMOFolder"
                        label="Путь до папки MO"
                        parent="modOrganizer"
                        value={currentConfig.modOrganizer.pathToMOFolder}
                        selectPathVariables={generateSelectOptions([PathVariableName.GAME_DIR])}
                        pathVariables={pathVariables}
                        isDisabled={!currentConfig.modOrganizer.isUsed}
                        description="Задает путь до основной папки Mod Organizer."
                        validationErrors={validationErrors}
                        onChange={onPathSelectorChange}
                      />
                    </div>
                    <div className="developer__block">
                      <TextField
                        className="developer__item"
                        id="baseFilesEncoding"
                        name="baseFilesEncoding"
                        label="Кодировка файлов настроек"
                        value={currentConfig.baseFilesEncoding}
                        description="Кодировка, которая будет по умолчанию применяться при чтении и записи данных файлов игровых настроек." //eslint-disable-line max-len
                        placeholder={gameSettingsConfig.baseFilesEncoding}
                        onChange={onTextFieldChange}
                      />
                    </div>
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
                      <p className="developer__block-title">Настройка игровых опций</p>
                      <p className="developer__subtitle">Файлы игровых настроек</p>
                      <ul className={styles.developer__list}>
                        {
                        currentConfig.gameSettingsFiles.length > 0
                        && currentConfig.gameSettingsFiles.map((file, index) => (
                          <SpoilerListItem<IGameSettingsFile>
                            key={file.name}
                            item={file}
                            items={currentConfig.gameSettingsFiles}
                            position={index}
                            lastItemId={lastAddedFileId}
                            summaryText={[
                              { label: 'Имя файла:', text: file.label },
                              { label: 'Путь:', text: file.path }]}
                            validationErrors={validationErrors}
                            onDeleteItem={deleteGameSettingsFile}
                          >
                            <GameSettingsFileItem
                              file={file}
                              pathVariables={pathVariables}
                              validationErrors={validationErrors}
                              isModOrganizerUsed={currentConfig.modOrganizer.isUsed}
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
                        currentConfig.gameSettingsOptions.length > 0
                        && currentConfig.gameSettingsOptions.map((currentOption, index) => (
                          <SpoilerListItem<IGameSettingsOption>
                            key={currentOption.id}
                            item={currentOption}
                            items={currentConfig.gameSettingsOptions}
                            position={index}
                            summaryText={[{ label: '', text: currentOption.label }]}
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
                      </ul>
                      {
                        currentConfig.gameSettingsOptions.length === 0
                        && currentConfig.gameSettingsFiles.length !== 0
                        && <p> Нет игровых опций</p>
                      }
                      {
                        currentConfig.gameSettingsOptions.length === 0
                        && currentConfig.gameSettingsFiles.length === 0
                        && <p> Добавьте хотя бы один игровой файл, чтобы добавлять игровые опции</p>
                      }
                      {
                        currentConfig.gameSettingsFiles.length > 0 && (
                        <Button
                          className={classNames('main-btn', 'developer__btn')}
                          onClick={addGameSettingsOption}
                        >
                          Добавить
                        </Button>
                        )
                      }
                    </div>
                  </React.Fragment>
                )
              }
            </ScrollbarsBlock>
          </React.Fragment>
        )
      }
      {
        !isGameSettingsConfigFileExists && (
          <div className="developer__block">
            <p className="developer__block-title">Отсутствует файл игровых настроек</p>
            <Button
              className={classNames('main-btn', 'developer__btn')}
              onClick={addGameSettingsConfigFile}
            >
              Создать
            </Button>
          </div>
        )
      }
    </div>
  );
};
