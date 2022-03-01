import { ipcRenderer } from 'electron';
import React, {
  useCallback,
  useState,
  ReactElement,
  useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import { NumberField } from '$components/UI/NumberField';
import { TextField } from '$components/UI/TextField';
import { Switcher } from '$components/UI/Switcher';
import { Select } from '$components/UI/Select';
import { PathSelector } from '$components/UI/PathSelector';
import {
  saveLauncherConfig,
  addMessages,
  setIsFirstLaunch,
} from '$actions/main';
import { CreateUserMessage } from '$utils/message';
import {
  appWindowFields,
  FileExtension,
  LauncherButtonAction,
  PathVariableName,
} from '$constants/misc';
import { MinWindowSize } from '$constants/defaultParameters';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/CustomBtnItem';
import {
  ILauncherConfig,
  ILauncherCustomButton,
  IMainRootState,
} from '$types/main';
import { Loader } from '$components/UI/Loader';
import { generateSelectOptions } from '$utils/data';
import { ArgumentsBlock } from '$components/ArgumentsBlock';
import { checkObjectForEqual } from '$utils/check';
import { Header } from '$components/Header';

export const DeveloperScreen: React.FC = () => {
  const pathVariables = useAppSelector((state) => state.main.pathVariables);
  const launcherConfig = useAppSelector((state) => state.main.config);
  const isGameSettingsSaving = useAppSelector((state) => state.main.isGameSettingsSaving);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IMainRootState['config']>(launcherConfig);
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (launcherConfig.isFirstLaunch) {
      dispatch(setIsFirstLaunch(false));
    }

    ipcRenderer.on('window resized', (event, windowSize) => {
      const newConfig = {
        ...currentConfig,
        width: windowSize[0],
        height: windowSize[1],
      };

      setCurrentConfig(newConfig);
      setIsConfigChanged(!checkObjectForEqual(launcherConfig, newConfig));
    });

    return (): void => { ipcRenderer.removeAllListeners('window resized'); };
  }, [dispatch, launcherConfig, currentConfig]);

  const changeCurrentConfig = useCallback((fieldName, value, parent?) => {
    let newConfig: ILauncherConfig;

    if (parent) {
      newConfig = {
        ...currentConfig,
        [parent]: {
          ...currentConfig[parent],
          [fieldName]: value,
        },
      };
    } else {
      newConfig = {
        ...currentConfig,
        [fieldName]: value,
      };
    }

    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(launcherConfig, newConfig));
  }, [launcherConfig, currentConfig]);

  const setValidationError = useCallback((id: string) => {
    if (!validationErrors.includes(id)) {
      setValidationErrors([...validationErrors, id]);
    }
  }, [validationErrors]);

  const clearFromValidationErrors = useCallback((ids: string[]) => {
    setValidationErrors(validationErrors.filter((currentId) => !ids.includes(currentId)));
  }, [validationErrors]);

  const sendIncorrectPathErrorMessage = useCallback(() => {
    dispatch(addMessages([CreateUserMessage.error('Выбран некорректный путь до папки. Подробности в файле лога.')])); //eslint-disable-line max-len
  }, [dispatch]);

  const onPathSelectorChange = useCallback((
    value: string|undefined,
    id: string,
    parent: string,
  ) => {
    let pathStr = value;

    if (pathStr !== undefined) {
      if (pathStr === '') {
        if (parent) {
          pathStr = currentConfig[parent][id];
        } else {
          pathStr = currentConfig[id];
        }
      }

      changeCurrentConfig(
        id,
        pathStr,
        parent,
      );
    } else {
      dispatch(addMessages([CreateUserMessage.error('Выбран некорректный путь до папки. Подробности в файле лога.')])); //eslint-disable-line max-len
    }
  }, [dispatch, currentConfig, changeCurrentConfig]);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (+target.value < +target.min) {
      setValidationError(target.id);
    } else if (currentConfig.isResizable) {
      if (target.id === 'width' && (+target.value < currentConfig.minWidth)) {
        setValidationError(target.id);
        setValidationError('minWidth');
      } else {
        clearFromValidationErrors([target.id, 'minWidth']);
      }
    } else {
      clearFromValidationErrors([target.id]);
    }
    changeCurrentConfig(target.id, Math.round(+target.value), target.dataset.parent);
  }, [currentConfig, changeCurrentConfig, setValidationError, clearFromValidationErrors]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, target.checked, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSelectChange = useCallback(({ target }: React.ChangeEvent<HTMLSelectElement>) => {
    changeCurrentConfig(target.id, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onCustomBtnDeleteClick = useCallback((id: string) => {
    changeCurrentConfig('customButtons', currentConfig.customButtons
      .filter((currentBtn) => currentBtn.id !== id)
      .map((currentBtn, index) => ({
        ...currentBtn,
        id: `customBtn${index}`,
      })));
  }, [currentConfig, changeCurrentConfig]);

  const onAddCustomBtnBtnClick = useCallback(() => {
    const newButtons = [
      ...currentConfig.customButtons,
      {
        path: `${PathVariableName.GAME_DIR}\\`,
        action: LauncherButtonAction.OPEN,
        id: `customBtn${currentConfig.customButtons.length}`,
        label: 'Запуск',
        args: [],
      }];

    changeCurrentConfig('customButtons', newButtons);
  }, [currentConfig, changeCurrentConfig]);

  const onCustomBtnChange = useCallback((newBtnData: ILauncherCustomButton, fieldName: string) => {
    const newButtons = currentConfig.customButtons.map((currentBtn) => {
      if (currentBtn.id === newBtnData.id) {
        return newBtnData;
      }

      return currentBtn;
    });

    changeCurrentConfig(fieldName, newButtons);
  }, [currentConfig, changeCurrentConfig]);

  const changeArguments = useCallback((
    newArgs: string[],
    parent: string,
  ) => {
    changeCurrentConfig('args', newArgs, parent);
  }, [changeCurrentConfig]);

  const onSaveBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const newConfig = { ...currentConfig, isFirstLaunch: false };

    if (
      launcherConfig.width !== +currentConfig.width
      || launcherConfig.height !== +currentConfig.height
    ) {
      ipcRenderer.send('resize window', +currentConfig.width, +currentConfig.height);
    }

    if (launcherConfig.isResizable !== currentConfig.isResizable) {
      ipcRenderer.send('set resizable window', currentConfig.isResizable);
    }

    dispatch(saveLauncherConfig(
      newConfig,
      currentTarget.id === 'ok_btn',
    ));

    if (currentConfig.isFirstLaunch) {
      setCurrentConfig(newConfig);
    }

    setIsConfigChanged(false);
  }, [dispatch,
    currentConfig,
    launcherConfig.width,
    launcherConfig.height,
    launcherConfig.isResizable]);

  const resetConfigChanges = useCallback((event) => {
    setIsConfigChanged(false);
    setValidationErrors([]);

    if (currentConfig.isFirstLaunch) {
      event.preventDefault();
    } else {
      setCurrentConfig(launcherConfig);
    }
  }, [launcherConfig, currentConfig.isFirstLaunch, setValidationErrors]);

  const onResetBtnClick = useCallback((event) => {
    resetConfigChanges(event);
  }, [resetConfigChanges]);

  const onCancelBtnClick = useCallback((event) => {
    resetConfigChanges(event);
    ipcRenderer.send('close dev window');
  }, [resetConfigChanges]);

  const getNumberFieldMinValue = useCallback((id: string): number => {
    if (!currentConfig.isResizable) {
      if (id === 'width' || id === 'minWidth') {
        return MinWindowSize.WIDTH;
      } else if (id === 'height' || id === 'minHeight') {
        return MinWindowSize.HEIGHT;
      }
    }

    return 0;
  }, [currentConfig]);

  const getNumberFieldIsDisabled = useCallback((id: string): boolean => !currentConfig.isResizable && (
    id === 'minWidth'
    || id === 'minHeight'
    || id === 'maxWidth'
    || id === 'maxHeight'
  ), [currentConfig]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <React.Fragment>
      <Header onClose={onCancelBtnClick} />
      <main className={classNames('main', styles['developer-screen__main'])}>
        <form
          className={styles['develover-screen__form']}
        >
          <div className={styles['develover-screen__controller']}>
            <Button
              id="ok_btn"
              onClick={onSaveBtnClick}
              className={classNames(
                'main-btn',
                'control-panel__btn',
              )}
              isDisabled={!isConfigChanged || validationErrors.length > 0}
            >
              ОК
            </Button>
            <Button
              onClick={onCancelBtnClick}
              className={classNames(
                'main-btn',
                'control-panel__btn',
              )}
            >
              Отмена
            </Button>
            <Button
              onClick={onSaveBtnClick}
              className={classNames(
                'main-btn',
                'control-panel__btn',
              )}
              isDisabled={!isConfigChanged || validationErrors.length > 0}
            >
              Сохранить
            </Button>
            <Button
              onClick={onResetBtnClick}
              className={classNames(
                'main-btn',
                'control-panel__btn',
              )}
              isDisabled={!isConfigChanged}
            >
              Сбросить
            </Button>
          </div>
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
            <div className={styles['developer-screen__block']}>
              <p className={styles['developer-screen__block-title']}>Настройки резмеров окна</p>
              <Switcher
                className={styles['developer-screen__item']}
                id="isResizable"
                label="Изменяемый размер окна?"
                isChecked={currentConfig.isResizable}
                onChange={onSwitcherChange}
              />
              {
              appWindowFields.map((field) => (
                <NumberField
                  className={styles['developer-screen__item']}
                  id={field.id}
                  value={currentConfig[field.id]}
                  label={field.label}
                  min={getNumberFieldMinValue(field.id)}
                  isDisabled={getNumberFieldIsDisabled(field.id)}
                  isValidationError={validationErrors.includes(field.id)}
                  onChange={onNumberInputChange}
                />
              ))
            }
            </div>
            <div className={styles['developer-screen__block']}>
              <p className={styles['developer-screen__block-title']}>
                Настройки путей и запуска программ
              </p>
              <TextField
                className={styles['developer-screen__item']}
                id="gameName"
                value={currentConfig.gameName}
                label="Название игры"
                onChange={OnTextFieldChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="documentsPath"
                label="Путь до папки файлов игры в [User]/Documents"
                value={currentConfig.documentsPath}
                options={generateSelectOptions([PathVariableName.DOCUMENTS])}
                pathVariables={pathVariables}
                isGameDocuments={false}
                onChange={onPathSelectorChange}
              />
              <p className={styles['developer-screen__text']}>Настройки запуска игры</p>
              <TextField
                className={styles['developer-screen__item']}
                id="label"
                parent="playButton"
                value={currentConfig.playButton.label}
                label="Текст кнопки запуска"
                onChange={OnTextFieldChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="path"
                parent="playButton"
                label="Путь до исполняемого файла игры"
                value={currentConfig.playButton.path}
                options={generateSelectOptions([PathVariableName.GAME_DIR])}
                pathVariables={pathVariables}
                extensions={FileExtension.EXECUTABLE}
                isSelectFile
                onChange={onPathSelectorChange}
              />
              <ArgumentsBlock
                args={currentConfig.playButton.args!}
                parent="playButton"
                pathVariables={pathVariables}
                className={styles['developer-screen__item']}
                changeArguments={changeArguments}
                onPathError={sendIncorrectPathErrorMessage}
              />
              <div className={styles['developer-screen__custom-btns']}>
                <p className={styles['developer-screen__text']}>
                  Кнопки запуска дополнительных программ
                </p>
                <ul className={styles['developer-screen__custom-btns-container']}>
                  {
                currentConfig.customButtons.map((item) => (
                  <CustomBtnItem
                    key={item.id}
                    item={item}
                    fieldName="customButtons"
                    pathVariables={pathVariables}
                    onDeleteBtnClick={onCustomBtnDeleteClick}
                    onChangeBtnData={onCustomBtnChange}
                    onPathError={sendIncorrectPathErrorMessage}
                  />
                ))
              }
                </ul>
                <Button
                  className={classNames('main-btn', 'developer-screen__btn')}
                  onClick={onAddCustomBtnBtnClick}
                >
                  Добавить кнопку
                </Button>
              </div>
            </div>
            <div className={styles['developer-screen__block']}>
              <p className={styles['developer-screen__block-title']}>Настройки Mod Organizer</p>
              <Switcher
                className={styles['developer-screen__item']}
                id="isUsed"
                parent="modOrganizer"
                label="Используется ли MO?"
                isChecked={currentConfig.modOrganizer.isUsed}
                onChange={onSwitcherChange}
              />
              <Select
                className={styles['developer-screen__item']}
                id="version"
                parent="modOrganizer"
                label="Версия MO"
                optionsArr={[
                  { label: 'Mod Organizer', value: '1' },
                  { label: 'Mod Organizer 2', value: '2' },
                ]}
                value={currentConfig.modOrganizer.version.toString()}
                isDisabled={!currentConfig.modOrganizer.isUsed}
                onChange={onSelectChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="pathToMOFolder"
                label="Путь до папки MO"
                parent="modOrganizer"
                value={currentConfig.modOrganizer.pathToMOFolder}
                options={generateSelectOptions([PathVariableName.GAME_DIR])}
                pathVariables={pathVariables}
                isDisabled={!currentConfig.modOrganizer.isUsed}
                onChange={onPathSelectorChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="pathToMods"
                label="Путь до папки модов MO"
                parent="modOrganizer"
                value={currentConfig.modOrganizer.pathToMods}
                options={generateSelectOptions([PathVariableName.MO_DIR])}
                pathVariables={pathVariables}
                isDisabled={!currentConfig.modOrganizer.isUsed}
                onChange={onPathSelectorChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="pathToProfiles"
                label="Путь до папки профилей MO"
                parent="modOrganizer"
                value={currentConfig.modOrganizer.pathToProfiles}
                options={generateSelectOptions([PathVariableName.MO_DIR])}
                pathVariables={pathVariables}
                isDisabled={!currentConfig.modOrganizer.isUsed}
                onChange={onPathSelectorChange}
              />
              <PathSelector
                className={styles['developer-screen__item']}
                id="pathToINI"
                label="Путь до конфигурационного файла MO"
                parent="modOrganizer"
                value={currentConfig.modOrganizer.pathToINI}
                options={generateSelectOptions([PathVariableName.MO_DIR])}
                pathVariables={pathVariables}
                isSelectFile
                extensions={FileExtension.INI}
                isDisabled={!currentConfig.modOrganizer.isUsed}
                onChange={onPathSelectorChange}
              />
            </div>
          </Scrollbars>
        </form>
        {
        isGameSettingsSaving
        && <Loader />
      }
      </main>
    </React.Fragment>
  );
};
