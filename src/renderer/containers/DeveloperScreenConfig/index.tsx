import { ipcRenderer } from 'electron';
import React, {
  useCallback,
  useState,
  useEffect,
  ReactElement,
} from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import { NumberField } from '$components/UI/NumberField';
import { TextField } from '$components/UI/TextField';
import { Switcher } from '$components/UI/Switcher';
import { Select } from '$components/UI/Select';
import { PathSelector } from '$components/UI/PathSelector';
import { saveLauncherConfig } from '$actions/main';
import {
  appWindowFields,
  FileExtension,
  LauncherButtonAction,
  PathVariableName,
  AppChannel,
} from '$constants/misc';
import { MinWindowSize } from '$constants/defaultParameters';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/CustomBtnItem';
import {
  IButtonArg,
  ILauncherCustomButton,
  IMainRootState,
} from '$types/main';
import {
  generateSelectOptions, getNewConfig, getUniqueValidationErrors,
} from '$utils/data';
import { ArgumentsBlock } from '$components/ArgumentsBlock';
import {
  checkObjectForEqual,
  getIsWindowSettingEqual,
  IValidationData,
  validateNumberInputs,
} from '$utils/check';
import { getRandomId } from '$utils/strings';
import { IValidationErrors } from '$types/common';
import { DeveloperScreenController } from '$components/DeveloperScreenController';

export const DeveloperScreenConfig: React.FC = () => {
  const pathVariables = useAppSelector((state) => state.main.pathVariables);
  const launcherConfig = useAppSelector((state) => state.main.config);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IMainRootState['config']>(launcherConfig);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);

  const saveConfigChanges = useCallback((
    isGoToMainScreen: boolean,
  ) => {
    const newConfig = { ...currentConfig, isFirstLaunch: false };

    if (!getIsWindowSettingEqual(launcherConfig, currentConfig)) {
      ipcRenderer.send(AppChannel.CHANGE_WINDOW_SETTINGS, {
        isResizable: currentConfig.isResizable,
        width: currentConfig.width,
        height: currentConfig.height,
        minWidth: currentConfig.minWidth,
        maxWidth: currentConfig.maxWidth,
        minHeight: currentConfig.minHeight,
        maxHeight: currentConfig.maxHeight,
      });
    }

    dispatch(saveLauncherConfig(
      newConfig,
      isGoToMainScreen,
    ));

    setIsConfigChanged(false);
  }, [dispatch, currentConfig, launcherConfig]);

  const resetConfigChanges = useCallback(() => {
    setIsConfigChanged(false);
    setValidationErrors({});
    setCurrentConfig(launcherConfig);
  }, [launcherConfig, setValidationErrors]);

  useEffect(() => {
    ipcRenderer.on(AppChannel.DEV_WINDOW_CLOSED, (event, isByCloseWindowBtnClick: boolean) => {
      if (isByCloseWindowBtnClick) {
        resetConfigChanges();
      }
    });

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.DEV_WINDOW_CLOSED); };
  }, [resetConfigChanges]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, []);

  const onSaveBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    saveConfigChanges(currentTarget.id === 'ok_save_config_btn');
  }, [saveConfigChanges]);

  const onResetBtnClick = useCallback(() => {
    resetConfigChanges();
  }, [resetConfigChanges]);

  const onCancelBtnClick = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CLOSE_DEV_WINDOW);
  }, [resetConfigChanges]);

  const changeCurrentConfig = useCallback((fieldName: string, value, parent?: string|undefined) => {
    const newConfig = getNewConfig(currentConfig, value, fieldName, parent);

    setCurrentConfig(newConfig);
    setIsConfigChanged(!checkObjectForEqual(launcherConfig, newConfig));
  }, [launcherConfig, currentConfig, setIsConfigChanged]);

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
      id,
      pathStr,
      parent,
    );

    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      validationData.errors,
      validationData.isForAdd,
    ));
  }, [currentConfig, validationErrors, changeCurrentConfig]);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const errors = validateNumberInputs(target, currentConfig, validationErrors);
    setValidationErrors(errors);

    changeCurrentConfig(target.id, Math.round(+target.value), target.dataset.parent);
  }, [currentConfig, changeCurrentConfig, validationErrors]);

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
      .filter((currentBtn) => currentBtn.id !== id));
  }, [currentConfig, changeCurrentConfig]);

  const onAddCustomBtnBtnClick = useCallback(() => {
    const newButtons = [
      ...currentConfig.customButtons,
      {
        path: `${PathVariableName.GAME_DIR}\\`,
        action: LauncherButtonAction.OPEN,
        id: getRandomId('custom-btn'),
        label: 'Открыть папку',
        args: [],
      }];

    changeCurrentConfig('customButtons', newButtons);
  }, [currentConfig, changeCurrentConfig]);

  const onCustomBtnChange = useCallback((
    newBtnData: ILauncherCustomButton,
  ) => {
    const newButtons = currentConfig.customButtons.map((currentBtn) => {
      if (currentBtn.id === newBtnData.id) {
        return newBtnData;
      }

      return currentBtn;
    });

    changeCurrentConfig('customButtons', newButtons);
  }, [currentConfig, changeCurrentConfig]);

  const changeArguments = useCallback((
    newArgs: IButtonArg[],
    parent: string,
  ) => {
    changeCurrentConfig('args', newArgs, parent);
  }, [changeCurrentConfig]);

  const getNumberFieldMinValue = useCallback((id: string): number => {
    if (id === 'width' || id === 'minWidth') {
      return MinWindowSize.WIDTH;
    } else if (id === 'height' || id === 'minHeight') {
      return MinWindowSize.HEIGHT;
    }

    return 0;
  }, []);

  const getNumberFieldIsDisabled = useCallback((
    id: string,
  ): boolean => !currentConfig.isResizable && (
    id === 'minWidth'
    || id === 'minHeight'
    || id === 'maxWidth'
    || id === 'maxHeight'
  ), [currentConfig]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <form
      className="develover-screen__form"
    >
      <DeveloperScreenController
        isConfigChanged={isConfigChanged}
        isHaveValidationErrors={Object.keys(validationErrors).length > 0}
        isFirstLaunch={launcherConfig.isFirstLaunch}
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
        <div className="developer-screen__block">
          <p className="developer-screen__block-title">Настройки резмеров окна</p>
          <Switcher
            className="developer-screen__item"
            id="isResizable"
            label="Изменяемый размер окна?"
            isChecked={currentConfig.isResizable}
            onChange={onSwitcherChange}
            description="Определяет, может ли пользователь изменять размеры окна программы"
          />
          {
            appWindowFields.map((field) => (
              <NumberField
                key={field.id}
                className="developer-screen__item"
                id={field.id}
                value={currentConfig[field.id]}
                label={field.label}
                min={getNumberFieldMinValue(field.id)}
                isDisabled={getNumberFieldIsDisabled(field.id)}
                validationErrors={validationErrors[field.id]}
                description={field.description}
                onChange={onNumberInputChange}
              />
            ))
          }
        </div>
        <div className="developer-screen__block">
          <p className="developer-screen__block-title">
            Настройки путей и запуска программ
          </p>
          <TextField
            className="developer-screen__item"
            id="gameName"
            value={currentConfig.gameName}
            label="Заголовок окна программы"
            description="Название игры или любой текст, который будет отображаться в заголовке окна программы"//eslint-disable-line max-len
            onChange={OnTextFieldChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="documentsPath"
            label="Папка файлов игры в Documents"
            value={currentConfig.documentsPath}
            options={generateSelectOptions([PathVariableName.DOCUMENTS])}
            pathVariables={pathVariables}
            isGameDocuments={false}
            description="Путь до папки игры в [User]/Documents. Укажите этот путь, если нужно управлять данными из файлов в этой папке через экран игровых настроек"//eslint-disable-line max-len
            validationErrors={validationErrors.documentsPath}
            onChange={onPathSelectorChange}
          />
          <p className="developer-screen__text">Настройки запуска игры</p>
          <TextField
            className="developer-screen__item"
            id="label"
            parent="playButton"
            value={currentConfig.playButton.label}
            label="Заголовок кнопки запуска"
            description="Текст, который будет отображаться на основной кнопке запуска игры"//eslint-disable-line max-len
            validationErrors={validationErrors.label}
            onChange={OnTextFieldChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="path"
            parent="playButton"
            label="Исполняемый файл игры"
            value={currentConfig.playButton.path}
            options={generateSelectOptions([PathVariableName.GAME_DIR])}
            pathVariables={pathVariables}
            extensions={FileExtension.EXECUTABLE}
            selectorType={LauncherButtonAction.RUN}
            description="Путь до исполняемого файла игры, .exe или .lnk"//eslint-disable-line max-len
            validationErrors={validationErrors.path}
            onChange={onPathSelectorChange}
          />
          <ArgumentsBlock
            className="developer-screen__item"
            args={currentConfig.playButton.args!}
            parent="playButton"
            pathVariables={pathVariables}
            description="Дополнительные агрументы запуска приложения"
            validationErrors={validationErrors}
            changeArguments={changeArguments}
            onValidationError={setNewValidationErrors}
          />
          <div className={styles['developer-screen__custom-btns']}>
            <p className="developer-screen__text">
              Кнопки запуска дополнительных программ
            </p>
            <ul className={styles['developer-screen__custom-btns-container']}>
              {
              currentConfig.customButtons.map((item) => (
                <CustomBtnItem
                  key={item.id}
                  item={item}
                  pathVariables={pathVariables}
                  validationErrors={validationErrors}
                  onDeleteBtnClick={onCustomBtnDeleteClick}
                  onChangeBtnData={onCustomBtnChange}
                  onValidationError={setNewValidationErrors}
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
        <div className="developer-screen__block">
          <p className="developer-screen__block-title">Настройки Mod Organizer</p>
          <Switcher
            className="developer-screen__item"
            id="isUsed"
            parent="modOrganizer"
            label="Используется ли MO?"
            isChecked={currentConfig.modOrganizer.isUsed}
            description="Определяет, используется ли в игре\сборке Mod Organizer"//eslint-disable-line max-len
            onChange={onSwitcherChange}
          />
          <Select
            className="developer-screen__item"
            id="version"
            parent="modOrganizer"
            label="Версия MO"
            optionsArr={[
              { label: 'Mod Organizer', value: '1' },
              { label: 'Mod Organizer 2', value: '2' },
            ]}
            value={currentConfig.modOrganizer.version.toString()}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            description="Задает версию использемого Mod Organizer"
            onChange={onSelectChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="pathToMOFolder"
            label="Путь до папки MO"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToMOFolder}
            options={generateSelectOptions([PathVariableName.GAME_DIR])}
            pathVariables={pathVariables}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            description="Задает путь до основной папки Mod Organizer."
            validationErrors={validationErrors.pathToMOFolder}
            onChange={onPathSelectorChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="pathToMods"
            label="Путь до папки модов MO"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToMods}
            options={generateSelectOptions([PathVariableName.MO_DIR])}
            pathVariables={pathVariables}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            description="Задает путь до папки модов Mod Organizer. Если вы не меняли этот путь в МО, оставьте значение без изменений"//eslint-disable-line max-len
            validationErrors={validationErrors.pathToMods}
            onChange={onPathSelectorChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="pathToProfiles"
            label="Путь до папки профилей MO"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToProfiles}
            options={generateSelectOptions([PathVariableName.MO_DIR])}
            pathVariables={pathVariables}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            description="Задает путь до папки профилей Mod Organizer. Если вы не меняли этот путь в МО, оставьте значение без изменений"//eslint-disable-line max-len
            validationErrors={validationErrors.pathToProfiles}
            onChange={onPathSelectorChange}
          />
          <PathSelector
            className="developer-screen__item"
            id="pathToINI"
            label="Путь до конфигурационного файла MO"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToINI}
            options={generateSelectOptions([PathVariableName.MO_DIR])}
            pathVariables={pathVariables}
            selectorType={LauncherButtonAction.RUN}
            extensions={FileExtension.INI}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            description="Задает путь до конфигурационного файла Mod Organizer (ModOrganizer.ini)"//eslint-disable-line max-len
            validationErrors={validationErrors.pathToINI}
            onChange={onPathSelectorChange}
          />
        </div>
      </Scrollbars>
    </form>
  );
};
