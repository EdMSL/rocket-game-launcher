import React, {
  useCallback, useEffect, useState,
} from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { Button } from '$components/UI/Button';
import styles from './styles.module.scss';
import { IAppState } from '$store/store';

const launcherIcon = require('$images/icon.png');

export const Header: React.FunctionComponent = () => {
  const isResizable = useSelector((state: IAppState) => state.system.isResizable);

  const [isMaximize, setIsMaximize] = useState(false);

  useEffect(() => {
    ipcRenderer.on('max-unmax window', (evt, isMax) => {
      setIsMaximize(isMax);
    });

    return (): void => { ipcRenderer.removeAllListeners('max-unmax window'); };
  }, []);

  const onMinimizeAppClick = useCallback(() => {
    ipcRenderer.send('minimize window');
  }, []);

  const onMaximizeAppClick = useCallback(() => {
    ipcRenderer.send('max-unmax window', isMaximize);
  }, [isMaximize]);

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
        {
          isResizable && (
            <Button
              tabIndex={-1}
              className={classNames(
                styles.header__btn,
                styles[`header__btn--${isMaximize ? 'unmaximize' : 'maximize'}`],
              )}
              onClick={onMaximizeAppClick}
            >
              <span className={styles['header__btn-text']}>
                {isMaximize ? 'Unmaximize' : 'Maximize'}
              </span>
            </Button>
          )
        }
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
