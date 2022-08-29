import React, {
  useCallback, useState, useEffect,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { useDeveloperSelector } from '$store/store';
import { NumberField } from '$components/UI/NumberField';
import { TextField } from '$components/UI/TextField';
import { Switcher } from '$components/UI/Switcher';
import { PathSelector } from '$components/UI/PathSelector';
import {
  FileExtension,
  LauncherButtonAction,
  PathVariableName,
} from '$constants/misc';
import { MinWindowSize, appWindowFields } from '$constants/defaultData';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/Developer/CustomBtnItem';
import {
  IButtonArg,
  ILauncherConfig,
  ILauncherCustomButton,
} from '$types/main';
import {
  changeConfigArrayItem,
  generateSelectOptions,
  getNewConfig,
} from '$utils/data';
import { ArgumentsBlock } from '$components/Developer/ArgumentsBlock';
import { SpoilerListItem } from '$components/Developer/SpoilerListItem';
import {
  clearIDRelatedValidationErrors,
  getUniqueValidationErrors,
  IValidationErrors,
  validateNumberInputs,
  ValidationErrorCause,
  IValidationError,
} from '$utils/validation';
import { getRandomId } from '$utils/strings';
import { IUserMessage } from '$types/common';

interface IProps {
  currentConfig: ILauncherConfig,
  isSettingsInitialized: boolean,
  validationErrors: IValidationErrors,
  setNewConfig: (configData: ILauncherConfig, isCheckForChanges?: boolean) => void,
  setIsSettingsInitialized: (isInitialized: boolean) => void,
  resetConfigChanges: () => void,
  setValidationErrors: (errors: IValidationErrors) => void,
  addMessage: (errorMessage: IUserMessage|string) => void,
}

export const LauncherConfigurationScreen: React.FC<IProps> = ({
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
  const pathVariables = useDeveloperSelector((state) => state.developer.pathVariables);
  const launcherConfig = useDeveloperSelector((state) => state.developer.launcherConfig);
  const isConfigProcessing = useDeveloperSelector((state) => state.developer.isConfigProcessing);

  const [lastAddedBtnItemId, setLastAddedBtnItemId] = useState<string>('');
  /* eslint-enable max-len */

  useEffect(() => {
    if (currentConfig.playButton === undefined) {
      setNewConfig(launcherConfig, false);
    }

    if (!isSettingsInitialized && !isConfigProcessing) {
      resetConfigChanges();
      setIsSettingsInitialized(true);
    }
  }, [currentConfig.playButton,
    isSettingsInitialized,
    currentConfig,
    launcherConfig,
    isConfigProcessing,
    setNewConfig,
    setIsSettingsInitialized,
    resetConfigChanges]);

  const setNewValidationErrors = useCallback((errors: IValidationErrors) => {
    setValidationErrors(errors);
  }, [setValidationErrors]);

  const onPathSelectorChange = useCallback((
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

    setNewConfig(getNewConfig(currentConfig, id, pathStr, parent));

    setValidationErrors(getUniqueValidationErrors(
      validationErrors,
      validationData,
    ));
  }, [currentConfig, validationErrors, setValidationErrors, setNewConfig]);

  const onNumberInputChange = useCallback(({
    target: {
      id, value, name, min, dataset,
    },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const errors = validateNumberInputs(id, +value, name, +min, currentConfig, validationErrors);

    setValidationErrors(errors);

    setNewConfig(getNewConfig(
      currentConfig,
      name,
      Math.round(+value),
      dataset.parent,
    ));
  }, [currentConfig, setNewConfig, setValidationErrors, validationErrors]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.required) {
      setValidationErrors(getUniqueValidationErrors(
        validationErrors,
        [{
          id: target.id,
          error: {
            cause: ValidationErrorCause.EMPTY,
            text: 'Поле не может быть пустым',
          },
          isForAdd: target.value.trim() === '',
        }],
      ));
    }

    setNewConfig(getNewConfig(
      currentConfig,
      target.name,
      target.value,
      target.dataset.parent,
    ));
  }, [currentConfig, validationErrors, setValidationErrors, setNewConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = getNewConfig(
      currentConfig, target.name, target.checked, target.dataset.parent,
    );

    let errors = validateNumberInputs(
      'width', newConfig.width, 'width', undefined, newConfig, validationErrors,
    );
    errors = validateNumberInputs('width', newConfig.width, 'width', undefined, newConfig, errors);

    setValidationErrors(errors);

    setNewConfig(newConfig);
  }, [currentConfig, validationErrors, setNewConfig, setValidationErrors]);

  const deleteCustomBtnItem = useCallback((items: ILauncherCustomButton[]) => {
    setNewConfig({ ...currentConfig, customButtons: items });
    setLastAddedBtnItemId('');
  }, [currentConfig, setNewConfig]);

  const deleteCustomBtnById = useCallback((id: string) => {
    setNewConfig({
      ...currentConfig,
      customButtons: currentConfig.customButtons
        .filter((currentBtn) => currentBtn.id !== id),
    });

    setLastAddedBtnItemId('');
    setValidationErrors(clearIDRelatedValidationErrors(validationErrors, id));
  }, [currentConfig, validationErrors, setValidationErrors, setNewConfig]);

  const onAddCustomBtnBtnClick = useCallback(() => {
    const newId = getRandomId();

    setLastAddedBtnItemId(newId);
    setNewConfig({
      ...currentConfig,
      customButtons: [
        ...currentConfig.customButtons,
        {
          id: newId,
          path: `${PathVariableName.GAME_DIR}\\`,
          action: LauncherButtonAction.OPEN,
          label: 'Открыть папку',
          args: [],
        }],
    });
  }, [currentConfig, setNewConfig]);

  const changeCustomBtnData = useCallback((
    btnId: string,
    newBtnData: ILauncherCustomButton,
  ) => {
    setNewConfig({
      ...currentConfig,
      customButtons: changeConfigArrayItem(btnId, newBtnData, currentConfig.customButtons),
    });
  }, [currentConfig, setNewConfig]);

  const changeCustomButtonsOrder = useCallback((customButtons: ILauncherCustomButton[]) => {
    setNewConfig({ ...currentConfig, customButtons });
  }, [currentConfig, setNewConfig]);

  const changeArguments = useCallback((
    newArgs: IButtonArg[],
    parent: string,
  ) => {
    setNewConfig(getNewConfig(currentConfig, 'args', newArgs, parent));
  }, [currentConfig, setNewConfig]);

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
    <form className="developer__form">
      {
        currentConfig.playButton !== undefined && (
        <React.Fragment>
          <fieldset className="developer__block">
            <legend className="developer__block-title">Настройки главного окна</legend>
            <TextField
              className="developer__item"
              id="gameName"
              name="gameName"
              value={currentConfig.gameName}
              label="Заголовок окна"
              validationErrors={validationErrors}
              description="Название игры или любой текст, который будет отображаться в заголовке окна программы"//eslint-disable-line max-len
              onChange={OnTextFieldChange}
            />
            <Switcher
              className="developer__item"
              id="isResizable"
              name="isResizable"
              label="Изменяемый размер окна"
              isChecked={currentConfig.isResizable}
              onChange={onSwitcherChange}
              description="Определяет, может ли пользователь изменять размеры окна программы"
            />
            {
            appWindowFields.map((field) => (
              <NumberField
                key={field.name}
                className="developer__item"
                id={field.name}
                name={field.name}
                value={currentConfig[field.name]}
                label={field.label}
                min={getNumberFieldMinValue(field.name)}
                isDisabled={getNumberFieldIsDisabled(field.name)}
                validationErrors={validationErrors}
                description={field.description}
                onChange={onNumberInputChange}
              />
            ))
          }
          </fieldset>
          <fieldset className="developer__block">
            <legend className="developer__block-title">
              Настройки запуска программ
            </legend>
            <p className="developer__subtitle">Запуск игры</p>
            <TextField
              className="developer__item"
              id="label"
              name="label"
              parent="playButton"
              value={currentConfig.playButton.label}
              placeholder="Играть"
              label="Заголовок кнопки"
              description="Текст, который будет отображаться на основной кнопке запуска игры"//eslint-disable-line max-len
              validationErrors={validationErrors}
              onChange={OnTextFieldChange}
            />
            <PathSelector
              className="developer__item"
              id="path"
              name="path"
              parent="playButton"
              label="Исполняемый файл"
              value={currentConfig.playButton.path}
              selectPathVariables={generateSelectOptions([PathVariableName.GAME_DIR])}
              pathVariables={pathVariables}
              extensions={FileExtension.EXECUTABLE}
              selectorType={LauncherButtonAction.RUN}
              description="Путь до исполняемого файла игры, .exe или .lnk"//eslint-disable-line max-len
              isGameDocuments={false}
              validationErrors={validationErrors}
              onChange={onPathSelectorChange}
              onOpenPathError={addMessage}
            />
            <ArgumentsBlock
              className="developer__item"
              args={currentConfig.playButton.args!}
              parent="playButton"
              pathVariables={pathVariables}
              description="Дополнительные агрументы запуска приложения"
              validationErrors={validationErrors}
              changeArguments={changeArguments}
              onValidationError={setNewValidationErrors}
              addMessage={addMessage}
            />
            <div className={styles['custom-btns__container']}>
              <p className="developer__subtitle">
                Запуск дополнительных программ
              </p>
              <ul className="developer__list">
                {
                currentConfig.customButtons.map((customBtn, index) => (
                  <SpoilerListItem<ILauncherCustomButton>
                    key={customBtn.id}
                    item={customBtn}
                    items={currentConfig.customButtons}
                    lastItemId={lastAddedBtnItemId}
                    position={index}
                    summaryText={[
                      { label: 'Заголовок:', text: customBtn.label },
                      { label: 'Путь:', text: customBtn.path },
                    ]}
                    validationErrors={validationErrors}
                    onDeleteItem={deleteCustomBtnItem}
                    onChangeOrderItem={changeCustomButtonsOrder}
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
                      addMessage={addMessage}
                    />
                  </SpoilerListItem>
                ))
              }
              </ul>
              <Button
                className={classNames('main-btn', 'developer__btn')}
                onClick={onAddCustomBtnBtnClick}
              >
                Добавить кнопку
              </Button>
            </div>
          </fieldset>
        </React.Fragment>
        )
      }
    </form>
  );
};
