import React, {
  useCallback, useState, ReactElement,
} from 'react';
import classNames from 'classnames';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import { Number } from '$components/UI/Number';
import { Switcher } from '$components/UI/Switcher';
import { defaultLauncherConfig } from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';
import { Select } from '$components/UI/Select';
import { getPathFromFileInput } from '$utils/files';
import { PathSelector } from '$components/UI/PathSelector';
import { addMessages } from '$actions/main';
import { CreateUserMessage } from '$utils/message';

export const DeveloperScreen: React.FC = () => {
  const customPaths = useAppSelector((state) => state.system.customPaths);

  const [currentConfig, setCurrentConfig] = useState<ISystemRootState>(defaultLauncherConfig);

  const onSelectPathBtnClick = useCallback(async (id: string, parent: string) => {
    let pathToDir = await getPathFromFileInput(customPaths);

    if (pathToDir !== undefined) {
      if (pathToDir === '') {
        pathToDir = currentConfig.modOrganizer.path;
      }

      if (parent) {
        setCurrentConfig({
          ...currentConfig,
          [parent]: {
            ...currentConfig[parent],
            [id]: pathToDir,
          },
        });
      } else {
        setCurrentConfig({
          ...currentConfig,
          [id]: pathToDir,
        });
      }
    } else {
      addMessages([CreateUserMessage.error('Выбран некорректный путь до папки. Подробности в файле лога.')]); //eslint-disable-line max-len
    }
  }, [customPaths, currentConfig]);

  const onSelectPathTextInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (target.dataset.parent) {
      setCurrentConfig({
        ...currentConfig,
        [target.dataset.parent]: {
          ...currentConfig[target.dataset.parent],
          [target.id]: target.value,
        },
      });
    } else {
      setCurrentConfig({
        ...currentConfig,
        [target.id]: target.value,
      });
    }
  }, [currentConfig]);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [target.id]: target.value,
    });
  }, [currentConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.dataset.parent) {
      setCurrentConfig({
        ...currentConfig,
        [target.dataset.parent]: {
          ...currentConfig[target.dataset.parent],
          [target.id]: target.checked,
        },
      });
    } else {
      setCurrentConfig({
        ...currentConfig,
        [target.id]: target.checked,
      });
    }
  }, [currentConfig]);

  const onSelectChange = useCallback(() => {}, []);

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
          <Number
            className={styles['developer-screen__item']}
            id="width"
            value={currentConfig.width}
            label="Ширина"
            onChange={onNumberInputChange}
          />
          <Number
            className={styles['developer-screen__item']}
            id="height"
            value={currentConfig.height}
            label="Высота"
            onChange={onNumberInputChange}
          />
          <Number
            className={styles['developer-screen__item']}
            id="minWidth"
            value={currentConfig.minWidth}
            label="Минимальная ширина"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <Number
            className={styles['developer-screen__item']}
            id="minHeight"
            value={currentConfig.minHeight}
            label="Минимальная высота"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <Number
            className={styles['developer-screen__item']}
            id="maxWidth"
            value={currentConfig.maxWidth}
            label="Максимальная ширина"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
          <Number
            className={styles['developer-screen__item']}
            id="maxHeight"
            value={currentConfig.maxHeight}
            label="Максимальная высота"
            isDisabled={!currentConfig.isResizable}
            onChange={onNumberInputChange}
          />
        </div>
        <div className={styles['developer-screen__block']}>
          <p className={styles['developer-screen__block-title']}>Настройки приложений и пользовательских путей</p>
          <PathSelector
            className={styles['developer-screen__item']}
            id="documentsPath"
            label="Путь до папки файлов игры в Documents пользователя"
            value={currentConfig.documentsPath}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="documentsPath"
            label="Путь до .exe или .lnk файла игры"
            value={currentConfig.documentsPath}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
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
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
          <PathSelector
            className={styles['developer-screen__item']}
            id="pathToMods"
            label="Путь до папки модов Mod Organizer"
            parent="modOrganizer"
            value={currentConfig.modOrganizer.pathToMods}
            onChange={onSelectPathTextInputChange}
            onButtonClick={onSelectPathBtnClick}
          />
        </div>
      </Scrollbars>
    </main>
  );
};
