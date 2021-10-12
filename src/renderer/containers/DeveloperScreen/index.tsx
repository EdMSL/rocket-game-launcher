import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Number } from '$components/UI/Number';
import { Switcher } from '$components/UI/Switcher';
import { defaultLauncherConfig } from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';

export const DeveloperScreen: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<ISystemRootState>(defaultLauncherConfig);

  const onNumberInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [target.id]: target.value,
    });
  }, [currentConfig]);

  const onSwitcherChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [target.id]: target.checked,
    });
  }, [currentConfig]);

  return (
    <main className={classNames('main', styles['developer-screen__main'])}>
      <p>Developer Screen</p>
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
        <p className={styles['developer-screen__block-title']}>Настройки Mod Organizer</p>
        <Switcher
          className={styles['developer-screen__item']}
          id="isUsed"
          label="Mod Organizer будет использоваться?"
          isChecked={currentConfig.modOrganizer.isUsed}
          onChange={onSwitcherChange}
        />
      </div>
    </main>
  );
};
