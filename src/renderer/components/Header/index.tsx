import React, {
  useCallback, useEffect, useState,
} from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';
import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';

const launcherIcon = require('$images/icon.png');

// передача функции openAppInfo в компонент означает, что окно с этим компонетом является главным
interface IProps {
  onClose: (event) => void,
  openAppInfo?: () => void,
}

export const Header: React.FunctionComponent<IProps> = ({
  onClose,
  openAppInfo = null,
}) => {
  const isResizable = useAppSelector((state) => state.main.config.isResizable);
  const gameName = useAppSelector((state) => state.main.config.gameName);

  const [isMaximize, setIsMaximize] = useState(false);

  useEffect(() => {
    ipcRenderer.on('max-unmax window', (evt, isMax, windowType) => {
      setIsMaximize(isMax);
    });

    return (): void => { ipcRenderer.removeAllListeners('max-unmax window'); };
  }, []);

  const onInfoAppClick = useCallback(() => {
    if (openAppInfo) {
      openAppInfo();
    }
  }, [openAppInfo]);

  const onMinimizeWindowClick = useCallback(() => {
    ipcRenderer.send('minimize window', openAppInfo ? 'main' : 'dev');
  }, [openAppInfo]);

  const onMaximizeWindowClick = useCallback(() => {
    ipcRenderer.send('max-unmax window', isMaximize, openAppInfo ? 'main' : 'dev');
  }, [isMaximize, openAppInfo]);

  const onCloseWindowBtnClick = useCallback((event) => {
    onClose(event);
  }, [onClose]);

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
          {
            openAppInfo && (
              <Button
                className={classNames(styles.header__btn, styles['header__btn--info'])}
                onClick={onInfoAppClick}
              >
                <span className={styles['header__btn-text']}>Info</span>
              </Button>
            )
          }
          <Button
            className={classNames(styles.header__btn, styles['header__btn--fold'])}
            onClick={onMinimizeWindowClick}
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
              onClick={onMaximizeWindowClick}
            >
              <span className={styles['header__btn-text']}>
                {isMaximize ? 'Unmaximize' : 'Maximize'}
              </span>
            </Button>
          )
        }
          <Button
            className={classNames(styles.header__btn, styles['header__btn--close'])}
            onClick={onCloseWindowBtnClick}
          >
            <span className={styles['header__btn-text']}>Close</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
