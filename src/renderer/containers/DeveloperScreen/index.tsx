import { ipcRenderer } from 'electron';
import React, {
  useCallback,
  useState,
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
import { defaultLauncherConfig, defaultLauncherCustomButton } from '$constants/defaultParameters';
import { ILauncherCustomButton, ISystemRootState } from '$types/system';
import { Select } from '$components/UI/Select';
import { PathSelector } from '$components/UI/PathSelector';
import { addMessages } from '$actions/main';
import { CreateUserMessage } from '$utils/message';
import { Checkbox } from '$components/UI/Checkbox';
import { LauncherButtonAction } from '$constants/misc';
import { Button } from '$components/UI/Button';
import { CustomBtnItem } from '$components/CustomBtnItem';

export const DeveloperScreen: React.FC = () => {
  const customPaths = useAppSelector((state) => state.system.customPaths);
  const customButtons = useAppSelector((state) => state.system.customButtons);

  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<ISystemRootState>(defaultLauncherConfig);
  const [configCustomButtons, setConfigCustomButtons] = useState<ILauncherCustomButton[]>(customButtons);

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

  const onSelectPathBtnClick = useCallback(async (id: string, parent: string) => {
    let pathStr: string = await ipcRenderer.invoke(
      'get path from native window',
      customPaths,
      (parent === 'playButton' || parent === 'customButton') && id === 'path',
    );

    if (pathStr !== undefined) {
      if (pathStr === '') {
        if (parent) {
          pathStr = currentConfig[parent][id];
        } else {
          pathStr = currentConfig[id];
        }
      }

      changeCurrentConfig(id, pathStr, parent);
    } else {
      dispatch(addMessages([CreateUserMessage.error('Выбран некорректный путь до папки. Подробности в файле лога.')])); //eslint-disable-line max-len
    }
  }, [dispatch, customPaths, currentConfig, changeCurrentConfig]);

  const onSelectPathTextInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeCurrentConfig(target.id, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, target.value, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    changeCurrentConfig(target.id, target.checked, target.dataset.parent);
  }, [changeCurrentConfig]);

  const onSelectChange = useCallback(() => {}, []);

  const onCustomBtnCheckboxChange = useCallback(() => {}, []);

  const onAddCustomBtnBtnClick = useCallback(() => {}, []);

  const onAddCustomPathBtnClick = useCallback(() => {}, []);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <main className={classNames('main', styles['developer-screen__main'])}>
      <p>Developer Screen</p>
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
            Настройки приложений и пользовательских путей
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
            label="Путь до папки файлов игры в Documents пользователя"
            value={currentConfig.documentsPath}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <p className={styles['developer-screen__text']}>Настройка пользовательских путей</p>
          <p className={styles['developer-screen__custom-block']}>
            {
              Object.keys(currentConfig.customPaths).map((currentCustomPath) => (
                <React.Fragment>
                  <TextField
                    className={styles['developer-screen__item']}
                    id="gameName"
                    value={currentCustomPath}
                    label="Название игры"
                    onChange={OnTextFieldChange}
                  />
                  <PathSelector
                    className={styles['developer-screen__item']}
                    id="documentsPath"
                    label="Путь до папки файлов игры в Documents пользователя"
                    value={currentConfig[currentCustomPath]}
                    onChange={onSelectPathTextInputChange}
                    onButtonClick={onSelectPathBtnClick}
                  />
                </React.Fragment>
              ))
            }
          </p>
          <Button onClick={onAddCustomPathBtnClick}>Добавить путь</Button>
          <p className={styles['developer-screen__text']}>Настройки запуска игры</p>
          <PathSelector
            className={styles['developer-screen__item']}
            id="path"
            parent="playButton"
            label="Путь до исполняемого файла игры"
            value={currentConfig.playButton.path}
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
                configCustomButtons.map((item) => (
                  <CustomBtnItem
                    key={item.id}
                    item={item}
                  />
                ))
              }
            </ul>
            <Button onClick={onAddCustomBtnBtnClick}>Добавить кнопку</Button>
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
            id="path"
            label="Путь до папки Mod Organizer"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.path}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="pathToMods"
            label="Путь до папки модов Mod Organizer"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToMods}
            isDisabled={!currentConfig.modOrganizer.isUsed}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
        </div>
      </Scrollbars>
    </main>
  );
};
