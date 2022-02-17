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
import { LauncherButtonAction, DefaultCustomPathName } from '$constants/misc';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/CustomBtnItem';
import { Routes } from '$constants/routes';
import { ILauncherConfig, IMainRootState } from '$types/main';
import { Loader } from '$components/UI/Loader';
import { generateSelectOptions } from '$utils/data';
import {
  clearPathVaribaleFromPathString, clearRootDirFromPathString, getPathToFile, replaceRootDirByPathVariable,
} from '$utils/strings';
import { GAME_DIR } from '$constants/paths';

export const DeveloperScreen: React.FC = () => {
  const pathVariables = useAppSelector((state) => state.main.pathVariables);
  const launcherConfig = useAppSelector((state) => state.main.config);
  const isGameSettingsSaving = useAppSelector((state) => state.main.isGameSettingsSaving);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IMainRootState['config']>(launcherConfig);

  useEffect(() => {
    if (launcherConfig.isFirstLaunch) {
      dispatch(setIsFirstLaunch(false));
    }
  }, [dispatch, launcherConfig.isFirstLaunch, currentConfig]);

  const changeCurrentConfig = useCallback((id, value, parent) => {
    if (parent) {
      setCurrentConfig({
        ...currentConfig,
        [parent]: {
          ...currentConfig[parent],
          [id]: value,
        },
      });
    } else {
      setCurrentConfig({
        ...currentConfig,
        [id]: value,
      });
    }
  }, [currentConfig]);

  const onSelectPathBtnClick = useCallback(async (
    id: string,
    parent: string,
    customPathVariable: string,
  ) => {
    let fileExtensions: string[] = [];

    if (id === 'pathToINI') {
      fileExtensions = ['ini'];
    } else if ((parent === 'playButton' || parent === 'customButton') && id === 'path') {
      fileExtensions = ['exe', 'lnk'];
    }

    let pathStr: string = await ipcRenderer.invoke(
      'get path from native window',
      { ...pathVariables },
      ((parent === 'playButton' || parent === 'customButton') && id === 'path')
      || id === 'pathToINI',
      id !== 'documentsPath',
      fileExtensions,
    );

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
        (parent === 'playButton' || parent === 'customButton') && id === 'path' ? pathStr : clearRootDirFromPathString(pathStr, id === 'documentsPath' ? pathVariables['%DOCUMENTS%'] : GAME_DIR),
        parent,
      );
    } else {
      dispatch(addMessages([CreateUserMessage.error('Выбран некорректный путь до папки. Подробности в файле лога.')])); //eslint-disable-line max-len
    }
  }, [dispatch, currentConfig, changeCurrentConfig, pathVariables]);

  const onSelectPathTextInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
    customPathVariable,
  ) => {
    changeCurrentConfig(
      target.id,
      (target.dataset.parent === 'playButton' || target.dataset.parent === 'customButton') && target.id === 'path' ? target.value : clearRootDirFromPathString(target.value, GAME_DIR),
      // target.value,
      target.dataset.parent,
    );
  }, [changeCurrentConfig]);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, Math.round(+target.value), target.dataset.parent);
  }, [changeCurrentConfig]);

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
    const newConfig: ILauncherConfig = {
      ...currentConfig,
      customButtons: currentConfig.customButtons
        .filter((currentBtn) => currentBtn.id !== id)
        .map((currentBtn, index) => ({
          ...currentBtn,
          id: `customBtn${index}`,
        })),
    };

    setCurrentConfig(newConfig);
  }, [currentConfig]);

  const onAddCustomBtnBtnClick = useCallback(() => {
    const newConfig: ILauncherConfig = {
      ...currentConfig,
      customButtons: [
        ...currentConfig.customButtons,
        {
          path: GAME_DIR,
          action: LauncherButtonAction.OPEN,
          id: `customBtn${currentConfig.customButtons.length}`,
          label: 'Запуск',
          args: [],
        }],
    };

    setCurrentConfig(newConfig);
  }, [currentConfig]);

  const onCustomBtnCheckboxChange = useCallback(() => {}, []);

  const onAddCustomPathBtnClick = useCallback(() => {}, []);

  const onSaveBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const newConfig = { ...currentConfig, isFirstLaunch: false };

    dispatch(saveLauncherConfig(
      newConfig,
      currentTarget.id === 'ok_btn',
    ));

    if (currentConfig.isFirstLaunch) {
      setCurrentConfig(newConfig);
    }
  }, [dispatch, currentConfig]);

  const onResetBtnClick = useCallback((event) => {
    if (currentConfig.isFirstLaunch) {
      event.preventDefault();
    } else {
      setCurrentConfig(launcherConfig);
    }
  }, [launcherConfig, currentConfig.isFirstLaunch]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <main className={classNames('main', styles['developer-screen__main'])}>
      <div className={styles['develover-screen__controller']}>
        <Button
          id="ok_btn"
          onClick={onSaveBtnClick}
          className={classNames(
            'button',
            'main-btn',
            'control-panel__btn',
          )}
        >
          ОК
        </Button>
        {
          !currentConfig.isFirstLaunch && (
            <NavLink
              exact
              to={Routes.MAIN_SCREEN}
              className={classNames(
                'button',
                'main-btn',
                'control-panel__btn',
              )}
              onClick={onResetBtnClick}
            >
              Отмена
            </NavLink>
          )
        }
        <Button
          onClick={onSaveBtnClick}
          className={classNames(
            'button',
            'main-btn',
            'control-panel__btn',
          )}
        >
          Сохранить
        </Button>
        <Button
          onClick={onResetBtnClick}
          className={classNames(
            'button',
            'main-btn',
            'control-panel__btn',
          )}
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
          <NumberField
            className={styles['developer-screen__item']}
            id="width"
            value={currentConfig.width}
            label="Ширина"
            onChange={onNumberInputChange}
          />
          <NumberField
            className={styles['developer-screen__item']}
            id="height"
            value={currentConfig.height}
            label="Высота"
            onChange={onNumberInputChange}
          />
          <NumberField
            className={styles['developer-screen__item']}
            id="minWidth"
            value={currentConfig.minWidth}
            label="Минимальная ширина"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <NumberField
            className={styles['developer-screen__item']}
            id="minHeight"
            value={currentConfig.minHeight}
            label="Минимальная высота"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <NumberField
            className={styles['developer-screen__item']}
            id="maxWidth"
            value={currentConfig.maxWidth}
            label="Максимальная ширина"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <NumberField
            className={styles['developer-screen__item']}
            id="maxHeight"
            value={currentConfig.maxHeight}
            label="Максимальная высота"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
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
            // value={clearPathVaribaleFromPathString(currentConfig.documentsPath)}
            options={generateSelectOptions([DefaultCustomPathName.DOCUMENTS])}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <p className={styles['developer-screen__text']}>Настройки запуска игры</p>
          <PathSelector
            className={styles['developer-screen__item']}
            id="path"
            parent="playButton"
            label="Путь до исполняемого файла игры"
            value={clearRootDirFromPathString(currentConfig.playButton.path, GAME_DIR)}
            // value={clearPathVaribaleFromPathString(currentConfig.playButton.path)}
            options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <TextField
            className={styles['developer-screen__item']}
            id="args"
            parent="playButton"
            value={currentConfig.playButton.args?.toString()}
            label="Аргументы запуска"
            onChange={OnTextFieldChange}
          />
          <TextField
            className={styles['developer-screen__item']}
            id="label"
            parent="playButton"
            value={currentConfig.playButton.label}
            label="Текст кнопки запуска"
            onChange={OnTextFieldChange}
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
                    onDeleteBtnClick={onCustomBtnDeleteClick}
                  />
                ))
              }
            </ul>
            <Button
              className={classNames('button', 'main-btn', 'developer-screen__btn')}
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
            label="Используется ли Mod Organizer?"
            isChecked={currentConfig.modOrganizer.isUsed}
            onChange={onSwitcherChange}
          />
          <Select
            className={styles['developer-screen__item']}
            id="version"
            parent="modOrganizer"
            label="Версия Mod Organizer"
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
            label="Путь до папки Mod Organizer"
            parent="modOrganizer"
            // value={clearPathVaribaleFromPathString(currentConfig.modOrganizer.path)}
            value={clearRootDirFromPathString(currentConfig.modOrganizer.pathToMOFolder, GAME_DIR)}
            options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="pathToMods"
            label="Путь до папки модов Mod Organizer"
            parent="modOrganizer"
            // value={clearPathVaribaleFromPathString(currentConfig.modOrganizer.pathToMods)}
            value={clearRootDirFromPathString(currentConfig.modOrganizer.pathToMods, GAME_DIR)}
            options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="pathToProfiles"
            label="Путь до папки профилей Mod Organizer"
            parent="modOrganizer"
            // value={clearPathVaribaleFromPathString(currentConfig.modOrganizer.pathToProfiles)}
            value={clearRootDirFromPathString(currentConfig.modOrganizer.pathToProfiles, GAME_DIR)}
            options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="pathToINI"
            label="Путь до конфигурационного файла Mod Organizer"
            parent="modOrganizer"
            // value={clearPathVaribaleFromPathString(currentConfig.modOrganizer.pathToINI)}
            value={clearRootDirFromPathString(currentConfig.modOrganizer.pathToINI, GAME_DIR)}
            options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
        </div>
      </Scrollbars>
      {
        isGameSettingsSaving
          && <Loader />
      }
    </main>
  );
};
