import { ipcRenderer } from 'electron';
import React, {
  useCallback, useState, useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { useDeveloperSelector } from '$store/store';
import { NumberField } from '$components/UI/NumberField';
import { TextField } from '$components/UI/TextField';
import { Switcher } from '$components/UI/Switcher';
import { Select } from '$components/UI/Select';
import { PathSelector } from '$components/UI/PathSelector';
import {
  appWindowFields,
  FileExtension,
  LauncherButtonAction,
  PathVariableName,
  AppChannel,
} from '$constants/misc';
import { MinWindowSize } from '$constants/defaultData';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/CustomBtnItem';
import {
  IButtonArg,
  ILauncherCustomButton,
} from '$types/main';
import {
  changeConfigArrayItem,
  clearValidationErrors,
  generateSelectOptions,
  getNewConfig,
  getUniqueValidationErrors,
} from '$utils/data';
import { ArgumentsBlock } from '$components/ArgumentsBlock';
import {
  checkObjectForEqual,
  IValidationData,
  validateNumberInputs,
} from '$utils/check';
import { getRandomId } from '$utils/strings';
import { IValidationErrors } from '$types/common';
import { DeveloperScreenController } from '$components/DeveloperScreenController';
import { IDeveloperRootState } from '$types/developer';
import { saveLauncherConfig, updateConfig } from '$actions/developer';
import { ScrollbarsBlock } from '$components/UI/ScrollbarsBlock';
import { Spoiler } from '$components/UI/Spoiler';

export const DeveloperConfigScreen: React.FC = () => {
  /* eslint-disable max-len */
  const pathVariables = useDeveloperSelector((state) => state.developer.pathVariables);
  const launcherConfig = useDeveloperSelector((state) => state.developer.launcherConfig);
  const isLauncherConfigProcessing = useDeveloperSelector((state) => state.developer.isLauncherConfigProcessing);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IDeveloperRootState['launcherConfig']>(launcherConfig);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [lastAddedBtnItemId, setLastAddedBtnItemId] = useState<string>('');
  const [isSettingsInitialized, setIsSettingsInitialized] = useState<boolean>(true);
  /* eslint-enable max-len */

  const saveConfigChanges = useCallback((
    isGoToMainScreen: boolean,
  ) => {
    const newConfig = { ...currentConfig, isFirstLaunch: false };

    dispatch(saveLauncherConfig(
      newConfig,
      isGoToMainScreen,
    ));

    setIsConfigChanged(false);
  }, [dispatch, currentConfig]);

  const resetConfigChanges = useCallback(() => {
    setIsConfigChanged(false);
    setValidationErrors({});
    setCurrentConfig(launcherConfig);
  }, [launcherConfig, setValidationErrors]);

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

    if (!isSettingsInitialized && !isLauncherConfigProcessing) {
      resetConfigChanges();
      setIsSettingsInitialized(true);
    }

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.CHANGE_DEV_WINDOW_STATE); };
  }, [isSettingsInitialized, isLauncherConfigProcessing, resetConfigChanges]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, []);

  const onSaveBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    saveConfigChanges(currentTarget.name === 'ok_save_config_btn');
  }, [saveConfigChanges]);

  const onResetBtnClick = useCallback(() => {
    resetConfigChanges();
  }, [resetConfigChanges]);

  const onCancelBtnClick = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
  }, [resetConfigChanges]);

  const onUpdateBtnClick = useCallback(() => {
    dispatch(updateConfig('launcher'));
    setIsSettingsInitialized(false);
  }, [dispatch]);

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

    changeCurrentConfig(target.name, Math.round(+target.value), target.dataset.parent);
  }, [currentConfig, changeCurrentConfig, validationErrors]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.name, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.name, target.checked, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSelectChange = useCallback(({ target }: React.ChangeEvent<HTMLSelectElement>) => {
    changeCurrentConfig(target.name, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const deleteCustomBtnItem = useCallback((items: ILauncherCustomButton[]) => {
    changeCurrentConfig('customButtons', items);
    setLastAddedBtnItemId('');
  }, [changeCurrentConfig]);

  const deleteCustomBtnById = useCallback((id: string) => {
    changeCurrentConfig('customButtons', currentConfig.customButtons
      .filter((currentBtn) => currentBtn.id !== id));

    setLastAddedBtnItemId('');
    setValidationErrors(clearValidationErrors(validationErrors, id));
  }, [currentConfig, validationErrors, changeCurrentConfig]);

  const onAddCustomBtnBtnClick = useCallback(() => {
    const newId = getRandomId();

    setLastAddedBtnItemId(newId);
    changeCurrentConfig('customButtons', [
      ...currentConfig.customButtons,
      {
        id: newId,
        path: `${PathVariableName.GAME_DIR}\\`,
        action: LauncherButtonAction.OPEN,
        label: 'Открыть папку',
        args: [],
      }]);
  }, [currentConfig, changeCurrentConfig]);

  const changeCustomBtnData = useCallback((
    btnId: string,
    newBtnData: ILauncherCustomButton,
  ) => {
    changeCurrentConfig(
      'customButtons',
      changeConfigArrayItem(btnId, newBtnData, currentConfig.customButtons),
    );
  }, [currentConfig, changeCurrentConfig]);

  const changeArguments = useCallback((
    newArgs: IButtonArg[],
    parent: string,
  ) => {
    changeCurrentConfig('args', newArgs, parent);
  }, [changeCurrentConfig]);

  const getNumberFieldMinValue = useCallback((name: string): number => {
    if (name === 'width' || name === 'minWidth') {
      return MinWindowSize.WIDTH;
    } else if (name === 'height' || name === 'minHeight') {
      return MinWindowSize.HEIGHT;
    }

    return 0;
  }, []);

  const getNumberFieldIsDisabled = useCallback((
    name: string,
  ): boolean => !currentConfig.isResizable && (
    name === 'minWidth'
    || name === 'minHeight'
    || name === 'maxWidth'
    || name === 'maxHeight'
  ), [currentConfig]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <form className="develover-screen__form">
      <DeveloperScreenController
        isConfigChanged={isConfigChanged}
        isHaveValidationErrors={Object.keys(validationErrors).length > 0}
        isFirstLaunch={launcherConfig.isFirstLaunch}
        isUpdateBtnDisabled
        onSaveBtnClick={onSaveBtnClick}
        onCancelBtnClick={onCancelBtnClick}
        onResetBtnClick={onResetBtnClick}
        onUpdateBtnClick={onUpdateBtnClick}
      />
      <ScrollbarsBlock>
        <React.Fragment>
          <div className="developer-screen__block">
            <p className="developer-screen__block-title">Настройки резмеров окна</p>
            <Switcher
              className="developer-screen__item"
              id="isResizable"
              name="isResizable"
              label="Изменяемый размер окна?"
              isChecked={currentConfig.isResizable}
              onChange={onSwitcherChange}
              description="Определяет, может ли пользователь изменять размеры окна программы"
            />
            {
            appWindowFields.map((field) => (
              <NumberField
                key={field.name}
                className="developer-screen__item"
                id={field.name}
                name={field.name}
                value={currentConfig[field.name]}
                label={field.label}
                min={getNumberFieldMinValue(field.name)}
                isDisabled={getNumberFieldIsDisabled(field.name)}
                validationErrors={validationErrors[field.name]}
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
              name="gameName"
              value={currentConfig.gameName}
              label="Заголовок окна программы"
              description="Название игры или любой текст, который будет отображаться в заголовке окна программы"//eslint-disable-line max-len
              onChange={OnTextFieldChange}
            />
            <PathSelector
              className="developer-screen__item"
              id="documentsPath"
              name="documentsPath"
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
              name="label"
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
              name="path"
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
                currentConfig.customButtons.map((customBtn, index) => (
                  <Spoiler<ILauncherCustomButton>
                    key={customBtn.id}
                    item={customBtn}
                    items={currentConfig.customButtons}
                    lastItemId={lastAddedBtnItemId}
                    position={index}
                    summaryText={[{ label: 'Заголовок:', text: customBtn.label }, { label: 'Путь:', text: customBtn.path }]}
                    onDeleteItem={deleteCustomBtnItem}
                    validationErrors={validationErrors}
                  >
                    <CustomBtnItem
                      key={customBtn.id}
                      item={customBtn}
                      pathVariables={pathVariables}
                      validationErrors={validationErrors}
                      lastItemId={lastAddedBtnItemId}
                      deleteBtnItem={deleteCustomBtnById}
                      сhangeBtnData={changeCustomBtnData}
                      onValidationError={setNewValidationErrors}
                    />
                  </Spoiler>
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
              name="isUsed"
              parent="modOrganizer"
              label="Используется ли MO?"
              isChecked={currentConfig.modOrganizer.isUsed}
              description="Определяет, используется ли в игре\сборке Mod Organizer"//eslint-disable-line max-len
              onChange={onSwitcherChange}
            />
            <Select
              className="developer-screen__item"
              id="version"
              name="version"
              parent="modOrganizer"
              label="Версия MO"
              options={[
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
              name="pathToMOFolder"
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
              name="pathToMods"
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
              name="pathToProfiles"
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
              name="pathToINI"
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
        </React.Fragment>
      </ScrollbarsBlock>
    </form>
  );
};
