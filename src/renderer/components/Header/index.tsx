import React, {
  useCallback, useEffect, useState,
} from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';
import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';

const launcherIcon = require('$images/icon.png');

interface IProps {
  openAppInfo: () => any,
}

export const Header: React.FunctionComponent<IProps> = ({
  openAppInfo,
}) => {
  const isResizable = useAppSelector((state) => state.config.isResizable);
  const gameName = useAppSelector((state) => state.config.gameName);

  const [isMaximize, setIsMaximize] = useState(false);

  useEffect(() => {
    ipcRenderer.on('max-unmax window', (evt, isMax) => {
      setIsMaximize(isMax);
    });

    return (): void => { ipcRenderer.removeAllListeners('max-unmax window'); };
  }, []);

  const onInfoAppClick = useCallback(() => {
    openAppInfo();
  }, [openAppInfo]);

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
    <header
      className={styles.header}
    >
      <div
        className={styles.header__wrapper}
        ref={(el) => {
          if (el) {
            el.style.setProperty('-webkit-app-region', 'drag', 'important');
          }
        }}
      >
        <div className={styles['header__logo-block']}>
          <img
            className={styles.header__logo}
            src={launcherIcon}
            alt="game logo"
          />
        </div>
        {
          gameName
          && <p className={styles['header__game-name']}>{gameName}</p>
        }
        <div className={styles.header__controls}>
          <Button
            className={classNames(styles.header__btn, styles['header__btn--info'])}
            onClick={onInfoAppClick}
          >
            <span className={styles['header__btn-text']}>Info</span>
          </Button>
          <Button
            className={classNames(styles.header__btn, styles['header__btn--fold'])}
            onClick={onMinimizeAppClick}
          >
            <span className={styles['header__btn-text']}>Fold</span>
          </Button>
          {
          isResizable && (
            <Button
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
            className={classNames(styles.header__btn, styles['header__btn--close'])}
            onClick={onCloseAppClick}
          >
            <span className={styles['header__btn-text']}>Close</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
