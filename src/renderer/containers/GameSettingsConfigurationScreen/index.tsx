import React, {
  useCallback, useEffect, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import styles from './styles.module.scss';
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
  getNewGameSettingsOption,
  getFullOption,
  getGameSettingsElementsNames,
  getNewConfig,
  getChangedOptionsAfterGroupDelete,
  getFileByFileName,
  getTempFileLabel,
} from '$utils/data';
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
  replacePathVariableByRootDir,
  replaceRootDirByPathVariable,
} from '$utils/strings';
import { EditableItem } from '$components/EditableItem';
import { HintItem } from '$components/HintItem';
import { GameSettingsFileItem } from '$components/Developer/GameSettingsFileItem';
import { GAME_DIR } from '$constants/paths';
import { CreateUserMessage } from '$utils/message';
import {
  addDeveloperMessages, createGameSettingsConfigFile,
} from '$actions/developer';
import { GameSettingsOptionItem } from '$components/Developer/GameSettingsOptionItem';
import { SpoilerListItem } from '$components/Developer/SpoilerListItem';
import {
  clearIDRelatedValidationErrors,
  getUniqueValidationErrors,
  IValidationError,
  IValidationErrors,
  validateFileRelatedFields,
  ValidationErrorCause,
} from '$utils/validation';
import { Switcher } from '$components/UI/Switcher';
import { PathSelector } from '$components/UI/PathSelector';
import { defaultFullGameSettingsOption } from '$constants/defaultData';
import { IUserMessage } from '$types/common';

interface IProps {
  currentConfig: IGameSettingsConfig,
  isSettingsInitialized: boolean,
  validationErrors: IValidationErrors,
  setNewConfig: (configData: IGameSettingsConfig, isCheckForChanges?: boolean) => void,
  setIsSettingsInitialized: (isInitialized: boolean) => void,
  resetConfigChanges: () => void,
  setValidationErrors: (errors: IValidationErrors) => void,
  addMessage: (errorMessage: IUserMessage|string) => void,
}

export const GameSettingsConfigurationScreen: React.FC<IProps> = ({
  currentConfig,
  isSettingsInitialized,
  validationErrors,
  setNewConfig,
  setIsSettingsInitialized,
  resetConfigChanges,
  setValidationErrors,
  addMessage,
}) => {
  /* eslint-disable max-len */
  const isGameSettingsConfigFileExists = useDeveloperSelector((state) => state.developer.isGameSettingsConfigFileExists);
  const gameSettingsConfig = useDeveloperSelector((state) => state.developer.gameSettingsConfig);
  const isConfigProcessing = useDeveloperSelector((state) => state.developer.isConfigProcessing);
  const isGameSettingsConfigDataLoaded = useDeveloperSelector((state) => state.developer.isGameSettingsConfigDataLoaded);
  const pathVariables = useDeveloperSelector((state) => state.developer.pathVariables);

  const [fullOptions, setFullOptions] = useState<IGameSettingsOption[]>([]);
  const [lastAddedGroupName, setLastAddedGroupName] = useState<string>('');
  const [lastAddedFileId, setLastAddedFileId] = useState<string>('');
  const [lastAddedOptionId, setLastAddedOptionId] = useState<string>('');

  const dispatch = useDispatch();
  /* eslint-enable max-len */

  const getPathFromPathSelector = useCallback(async (
  ): Promise<string> => ipcRenderer.invoke(
    AppChannel.GET_PATH_BY_PATH_SELECTOR,
    LauncherButtonAction.RUN,
    GAME_DIR,
  ), []);

  useEffect(() => {
    if (currentConfig.baseFilesEncoding === undefined) {
      setNewConfig(gameSettingsConfig, false);
    }

    if (!isSettingsInitialized && !isConfigProcessing && isGameSettingsConfigDataLoaded) {
      setFullOptions(gameSettingsConfig.gameSettingsOptions.map(
        (currentOption) => getFullOption(currentOption),
      ));
      resetConfigChanges();
      setIsSettingsInitialized(true);
    }
  }, [currentConfig,
    isSettingsInitialized,
    isGameSettingsConfigDataLoaded,
    isConfigProcessing,
    gameSettingsConfig,
    setNewConfig,
    setIsSettingsInitialized,
    resetConfigChanges]);

  const onTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewConfig(getNewConfig(currentConfig, target.name, target.value));
  }, [currentConfig, setNewConfig]);

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
        `В путях к некоторым файлам игровых настроек пристуствуют переменные Mod Organizer.\nВыберите "Отмена", чтобы вручную изменить пути к файлам, "Игнорировать", чтобы изменить переменную на ${PathVariableName.GAME_DIR}, или "Удалить", чтобы удалить файлы и связанные с ними игровые опции.\nИзменения будут приняты только при сохранении текущей конфигурации.`, //eslint-disable-line max-len
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
          const filesNames = getGameSettingsElementsNames(newFiles);

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

        setNewConfig(newConfig);
      }
    } else {
      setNewConfig(getNewConfig(currentConfig, target.name, target.checked, target.dataset.parent));
    }
  }, [currentConfig, setNewConfig, dispatch]);

  const onPathSelectorChange = useCallback(async (
    value: string,
    id: string,
    validationData: IValidationError[],
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

    if (
      id === 'documentsPath'
      && replacePathVariableByRootDir(
        pathStr,
        PathVariableName.DOCUMENTS,
        pathVariables['%DOCUMENTS%'],
      ) === pathVariables['%DOCUMENTS%']
      && currentConfig.gameSettingsFiles.length > 0
      && currentConfig.gameSettingsFiles.some(
        (currentFile) => PathRegExp.DOCS_GAME.test(currentFile.path),
      )
    ) {
      const messageBoxResponse = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        `В путях к некоторым файлам игровых настроек пристуствует переменная %DOCS_GAME%, но путь к папке игры в User/Documents не указан или был очищен.\nВыберите "Отмена", чтобы вручную изменить пути к файлам, "Игнорировать", чтобы изменить переменную на ${PathVariableName.GAME_DIR}, или "Удалить", чтобы удалить файлы и связанные с ними игровые опции.\nИзменения будут приняты только при сохранении текущей конфигурации.`, //eslint-disable-line max-len
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
            if (PathRegExp.DOCS_GAME.test(currentFile.path)) {
              changedFileNames.push(currentFile.label);

              return {
                ...currentFile,
                path: currentFile.path.replace(PathRegExp.DOCS_GAME, PathVariableName.GAME_DIR),
              };
            }

            return currentFile;
          });

          newConfig = {
            ...newConfig,
            documentsPath: pathStr,
            gameSettingsFiles: newFiles,
          };

          message = `При сохранении настроек для файлов [${changedFileNames.join()}] переменная пути будет изменена на ${PathVariableName.GAME_DIR}`; //eslint-disable-line max-len
        } else if (messageBoxResponse.response === 2) {
          const changedOptionsNames: string[] = [];

          const newFiles = newConfig.gameSettingsFiles.filter(
            (currentFile) => {
              if (PathRegExp.DOCS_GAME.test(currentFile.path)) {
                changedFileNames.push(currentFile.label);

                return false;
              }

              return true;
            },
          );
          const filesNames = getGameSettingsElementsNames(newFiles);

          newConfig = {
            ...newConfig,
            documentsPath: pathStr,
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
          };

          message = `При сохранении настроек файлы [${changedFileNames.join()}]${changedOptionsNames.length > 0 ? ` и опции [${changedOptionsNames.join()}]` : ''} будут удалены`; //eslint-disable-line max-len
        }

        dispatch(addDeveloperMessages([CreateUserMessage.info(message)]));
        setNewConfig(newConfig);
      }
    } else {
      setNewConfig(getNewConfig(
        currentConfig,
        id,
        pathStr,
        parent,
      ));
    }

    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      validationData,
    ));
  }, [currentConfig, validationErrors, pathVariables, dispatch, setValidationErrors, setNewConfig]);

  const getCurrentFullOption = useCallback((optionId: string) => fullOptions.find(
    (currentOption) => currentOption.id === optionId,
  ) || defaultFullGameSettingsOption, [fullOptions]);

  const createNewGroup = useCallback(() => {
    const newName = getRandomName();
    const newGroups = [...currentConfig.gameSettingsGroups, {
      name: newName,
      label: '',
    }];
    let newConfig = {
      ...currentConfig,
      gameSettingsGroups: newGroups,
    };

    if (newGroups.length === 1) {
      newConfig = {
        ...newConfig,
        gameSettingsOptions: currentConfig.gameSettingsOptions.map(
          (currentOption) => generateGameSettingsOption(
            {
              ...currentOption,
              settingGroup: newGroups[0].name,
            },
            getFileByFileName(currentConfig.gameSettingsFiles, currentOption.file)!,
            getFullOption(currentOption),
          ).newOption,
        ),
      };
    }

    setNewConfig(newConfig);

    setLastAddedGroupName(newName);
  }, [currentConfig, setNewConfig]);

  const editGroupItem = useCallback((value: string, name: string) => {
    setNewConfig({
      ...currentConfig,
      gameSettingsGroups: currentConfig.gameSettingsGroups.map((currentGroup) => {
        if (currentGroup.name === name) {
          return {
            ...currentGroup,
            label: value,
          };
        }

        return currentGroup;
      }),
    });

    if (lastAddedGroupName === name) {
      setLastAddedGroupName('');
    }
  }, [currentConfig, lastAddedGroupName, setNewConfig]);

  const validateGroupLabel = useCallback((value: string, name: string) => {
    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      [{
        id: name,
        error: {
          cause: ValidationErrorCause.EXISTS,
        },
        isForAdd: currentConfig.gameSettingsGroups.map((group) => group.label).includes(value)
          && currentConfig.gameSettingsGroups.find((group) => group.name === name)?.label !== value,
      }],
    ));
  }, [currentConfig.gameSettingsGroups, setValidationErrors, validationErrors]);

  const deleteGroupItem = useCallback(async (deletedGroupName: string) => {
    const newGroups = currentConfig.gameSettingsGroups.filter(
      (group) => group.name !== deletedGroupName,
    );

    if (currentConfig.gameSettingsOptions.some(
      (currentOption) => currentOption.settingGroup === deletedGroupName,
    )) {
      const messageBoxResponse = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        `Данная группа настроек используется некоторыми опциями.\nВыберите "Отмена", чтобы вручную изменить группы для опций, "Игнорировать", чтобы ${newGroups.length > 0 ? `изменить группу на ${gameSettingsConfig.gameSettingsGroups[0].label},` : 'убрать поле группы для всех опций,'} или "Удалить", чтобы удалить связанные с группой игровые опции.\nИзменения будут приняты только при сохранении текущей конфигурации.`, //eslint-disable-line max-len
        'Выберите действие',
        undefined,
        ['Отмена', 'Игнорировать', 'Удалить'],
        AppWindowName.DEV,
      );

      if (messageBoxResponse.response > 0) {
        const [newOptions, changedOptionsNames] = getChangedOptionsAfterGroupDelete(
          currentConfig.gameSettingsOptions,
          newGroups,
          currentConfig.gameSettingsFiles,
          messageBoxResponse.response === 2,
        );

        const newConfig = {
          ...currentConfig,
          gameSettingsGroups: newGroups,
          gameSettingsOptions: newOptions,
        };

        if (newGroups.length > 0 && messageBoxResponse.response === 1) {
          dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек для опций [${changedOptionsNames.join()}] используемая группа будет изменена на "${newGroups[0].label}".`)])); //eslint-disable-line max-len
        } else if (newGroups.length > 0 && messageBoxResponse.response === 2) {
          dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек опции [${changedOptionsNames.join()}] будут удалены.`)])); //eslint-disable-line max-len
        }

        setLastAddedGroupName('');
        setNewConfig(newConfig);
      }
    } else {
      setLastAddedGroupName('');
      setNewConfig({
        ...currentConfig,
        gameSettingsGroups: newGroups,
      });
    }

    setValidationErrors(clearIDRelatedValidationErrors(validationErrors, deletedGroupName));
  }, [currentConfig,
    gameSettingsConfig.gameSettingsGroups,
    validationErrors,
    setNewConfig,
    setValidationErrors,
    dispatch]);

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

        setNewConfig({
          ...currentConfig,
          gameSettingsFiles: [
            ...currentConfig.gameSettingsFiles,
            file,
          ],
        });
      } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
        dispatch(addDeveloperMessages([CreateUserMessage.error(
          'Выбранный файл находится в недопустимой папке.',
        )]));
      }
    }
  }, [pathVariables,
    currentConfig,
    dispatch,
    setNewConfig,
    getPathFromPathSelector]);

  const changeGameSettingsFiles = useCallback((
    fileId: string,
    fileData: IGameSettingsFile,
  ) => {
    const changedOptions = currentConfig.gameSettingsOptions.map((currentOption) => {
      if (currentOption.file === fileData.name) {
        return generateGameSettingsOption(
          currentOption,
          fileData,
          getCurrentFullOption(currentOption.id),
        ).newOption;
      }

      return currentOption;
    });

    const newConfig = {
      ...currentConfig,
      gameSettingsFiles: changeConfigArrayItem(fileId, fileData, currentConfig.gameSettingsFiles),
      gameSettingsOptions: changedOptions,
    };

    let currentValidationErrors = { ...validationErrors };

    newConfig.gameSettingsOptions.forEach((currentOption) => {
      currentValidationErrors = validateFileRelatedFields(
        currentOption,
        fileData,
        currentValidationErrors,
      );
    });

    setValidationErrors(currentValidationErrors);
    setNewConfig(newConfig);
  }, [currentConfig, validationErrors, setNewConfig, getCurrentFullOption, setValidationErrors]);

  const deleteGameSettingsFile = useCallback(async (
    newFiles: IGameSettingsFile[],
    deletedItem: IGameSettingsFile|undefined,
  ) => {
    if (deletedItem !== undefined) {
      if (currentConfig.gameSettingsOptions.some(
        (currentOption) => currentOption.file === deletedItem.name,
      )
      ) {
        const messageBoxResponse = await ipcRenderer.invoke(
          AppChannel.GET_MESSAGE_BOX_RESPONSE,
          `Одна или несколько игровых опций имеют данный файл в зависимостях. Выберите "Отмена", чтобы вручную изменить используемый опциями файл${newFiles.length > 0 ? ', "Игнорировать", чтобы автоматически выбрать для опции один из доступных файлов,' : ''} или "Удалить", чтобы удалить связанные с файлом опции.`, //eslint-disable-line max-len
          'Выберите действие',
          undefined,
          newFiles.length > 0 ? ['Отмена', 'Игнорировать', 'Удалить'] : ['Отмена', 'Удалить'],
          AppWindowName.DEV,
        );

        if (messageBoxResponse.response > 0) {
          const [newOptions, changedOptionsNames] = getChangedOptionsAfterFileDelete(
            currentConfig.gameSettingsOptions,
            newFiles,
            newFiles.length > 0
              ? messageBoxResponse.response === 2
              : messageBoxResponse.response === 1,
          );

          const newConfig = {
            ...currentConfig,
            gameSettingsFiles: newFiles,
            gameSettingsOptions: newOptions,
          };

          if (changedOptionsNames.length > 0) {
            if (newFiles.length > 0 && messageBoxResponse.response === 1) {
              dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек для опций [${changedOptionsNames.join()}] используемый файл будет изменен на "${newFiles[0].label}".`)])); //eslint-disable-line max-len
            } else {
              dispatch(addDeveloperMessages([CreateUserMessage.info(`При сохранении настроек опции [${changedOptionsNames.join()}] будут удалены.`)])); //eslint-disable-line max-len
            }
          }

          let currentValidationErrors = { ...validationErrors };

          newConfig.gameSettingsOptions.forEach((currentOption) => {
            currentValidationErrors = validateFileRelatedFields(
              currentOption,
              newFiles[0],
              currentValidationErrors,
            );
          });

          setLastAddedFileId('');
          setNewConfig(newConfig);
          setValidationErrors(currentValidationErrors);
        }
      } else {
        setLastAddedFileId('');
        setNewConfig({
          ...currentConfig,
          gameSettingsFiles: newFiles,
        });

        setValidationErrors(clearIDRelatedValidationErrors(validationErrors, deletedItem.id));
      }
    }
  }, [currentConfig, validationErrors, setValidationErrors, setNewConfig, dispatch]);

  const deleteGameSettingsFileById = useCallback((id: string) => {
    let deletedFile: IGameSettingsFile|undefined;
    const files = currentConfig.gameSettingsFiles.filter((item) => {
      if (id === item.id) {
        deletedFile = item;

        return false;
      }

      return true;
    });

    deleteGameSettingsFile(files, deletedFile);
  }, [currentConfig.gameSettingsFiles, deleteGameSettingsFile]);

  const changeGameSettingsOption = useCallback((
    optionId: string,
    optionData: IGameSettingsOption,
    fullOption: IGameSettingsOption,
  ) => {
    setNewConfig({
      ...currentConfig,
      gameSettingsOptions: changeConfigArrayItem(
        optionId,
        optionData,
        currentConfig.gameSettingsOptions,
      ),
    });

    setFullOptions(changeConfigArrayItem(
      fullOption.id,
      fullOption,
      fullOptions,
    ));
  }, [currentConfig, fullOptions, setNewConfig]);

  const addGameSettingsOption = useCallback(() => {
    const newOption = getNewGameSettingsOption(
      currentConfig.gameSettingsFiles[0],
      (currentConfig.gameSettingsGroups[0] && currentConfig.gameSettingsGroups[0].name) || '',
    );

    setValidationErrors(validateFileRelatedFields(
      newOption,
      currentConfig.gameSettingsFiles[0],
      validationErrors,
    ));

    setNewConfig({
      ...currentConfig,
      gameSettingsOptions: [
        ...currentConfig.gameSettingsOptions,
        newOption,
      ],
    });
    setLastAddedOptionId(newOption.id);
  }, [currentConfig,
    validationErrors,
    setNewConfig,
    setValidationErrors,
  ]);

  const deleteGameSettingsOption = useCallback((
    params: IGameSettingsOption[],
    deletedOption: IGameSettingsOption,
  ) => {
    setNewConfig({
      ...currentConfig,
      gameSettingsOptions: params,
    });

    setValidationErrors(clearIDRelatedValidationErrors(validationErrors, deletedOption.id));
    setLastAddedOptionId('');
  }, [validationErrors, currentConfig, setValidationErrors, setNewConfig]);

  const deleteGameSettingsOptionById = useCallback((id: string) => {
    setNewConfig({
      ...currentConfig,
      gameSettingsOptions: currentConfig.gameSettingsOptions.filter((item) => id !== item.id),
    });
    setLastAddedOptionId('');
  }, [currentConfig, setNewConfig]);

  const changeGameSettingsOptionOrder = useCallback((params: IGameSettingsOption[]) => {
    setNewConfig({
      ...currentConfig,
      gameSettingsOptions: params,
    });
  }, [currentConfig, setNewConfig]);

  const addGameSettingsConfigFile = useCallback(() => {
    dispatch(createGameSettingsConfigFile());
  }, [dispatch]);

  const onCollapseAllOptionsBtnClick = useCallback(() => {
    const spoilers = document.querySelector('#developer-list-options')?.querySelectorAll('.spoiler__item');
    spoilers?.forEach((spoiler) => {
      spoiler.querySelector('.spoiler__block')?.removeAttribute('open');
    });
  }, []);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <form className="developer__form">
      {
        isGameSettingsConfigFileExists
        && currentConfig.baseFilesEncoding !== undefined
        && isGameSettingsConfigDataLoaded
        && (
        <React.Fragment>
          <fieldset className="developer__block">
            <legend className="developer__block-title">Основное</legend>
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
            <PathSelector
              className="developer__item"
              id="documentsPath"
              name="documentsPath"
              label="Папка в Documents"
              value={currentConfig.documentsPath}
              selectPathVariables={generateSelectOptions([PathVariableName.DOCUMENTS])}
              pathVariables={pathVariables}
              isGameDocuments={false}
              description="Путь до папки игры в [User]/Documents. Укажите этот путь, если нужно управлять данными из файлов в этой папке через экран игровых настроек"//eslint-disable-line max-len
              validationErrors={validationErrors}
              onChange={onPathSelectorChange}
              onOpenPathError={addMessage}
            />
          </fieldset>
          <fieldset className="developer__block">
            <legend className="developer__block-title">Настройка Mod Organizer</legend>
            <Switcher
              className="developer__item"
              id="isUsed"
              name="isUsed"
              parent="modOrganizer"
              label="Используется Mod Organizer"
              isChecked={currentConfig.modOrganizer.isUsed}
              description="Определяет, используется ли в игре\сборке Mod Organizer"//eslint-disable-line max-len
              onChange={onSwitcherChange}
            />
            <PathSelector
              className="developer__item"
              id="pathToMOFolder"
              name="pathToMOFolder"
              label="Папка Mod Organizer"
              parent="modOrganizer"
              value={currentConfig.modOrganizer.pathToMOFolder}
              selectPathVariables={generateSelectOptions([PathVariableName.GAME_DIR])}
              pathVariables={pathVariables}
              isDisabled={!currentConfig.modOrganizer.isUsed}
              description="Задает путь до корневой папки Mod Organizer."
              validationErrors={validationErrors}
              onChange={onPathSelectorChange}
              onOpenPathError={addMessage}
            />
          </fieldset>
          <fieldset className="developer__block">
            <legend className="developer__block-title">Группы игровых опций</legend>
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
                        {/* eslint-disable-next-line max-len */}
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
            <HintItem
              className={styles['developer__groups-hint']}
              description="Группы настроек позволяют группировать опции. На экране настроек они будут отображаться в виде панели навигации." //eslint-disable-line max-len
              direction="left"
            />
          </fieldset>
          <fieldset className="developer__block">
            <legend className="developer__block-title">Настройка игровых опций</legend>
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
                      { label: 'Имя файла:', text: getTempFileLabel(file) },
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
                      onValidation={setValidationErrors}
                      deleteFile={deleteGameSettingsFileById}
                      addMessage={addMessage}
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
            <Button
              className={classNames('main-btn', 'developer__btn')}
              onClick={onCollapseAllOptionsBtnClick}
            >
              Свернуть все
            </Button>
            <ul
              id="developer-list-options"
              className={styles.developer__list}
            >
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
                      fullOption={getCurrentFullOption(currentOption.id)}
                      validationErrors={validationErrors}
                      onOptionDataChange={changeGameSettingsOption}
                      onValidation={setValidationErrors}
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
          </fieldset>
        </React.Fragment>
        )
      }
      {
        !isGameSettingsConfigFileExists && (
          <fieldset className="developer__block">
            <legend className="developer__block-title">Отсутствует файл игровых настроек</legend>
            <Button
              className={classNames('main-btn', 'developer__btn')}
              onClick={addGameSettingsConfigFile}
            >
              Создать
            </Button>
          </fieldset>
        )
      }
    </form>
  );
};
