import React, { useCallback } from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';
import styles from './styles.module.scss';

const launcherIcon = require('$images/icon.png');

export const Header: React.FunctionComponent = () => {
  const onMinimizeAppClick = useCallback(() => {
    ipcRenderer.send('minimize app');
  }, []);

  const onCloseAppClick = useCallback(() => {
    ipcRenderer.send('close app');
  }, []);

  return (
    <header className={styles.header}>
      <img
        className={styles.header__logo}
        src={launcherIcon}
        alt="game logo"
      />
      <p className={styles.header__title}>Rubicon Launcher</p>
      <div className={styles.header__controls}>
        <Button
          tabIndex={-1}
          className={classNames(styles.header__btn, styles['header__btn--fold'])}
          onClick={onMinimizeAppClick}
        >
          <span className={styles['header__btn-text']}>Fold</span>
        </Button>
        <Button
          tabIndex={-1}
          className={classNames(styles.header__btn, styles['header__btn--close'])}
          onClick={onCloseAppClick}
        >
          <span className={styles['header__btn-text']}>Close</span>
        </Button>
      </div>
    </header>
  );
};
