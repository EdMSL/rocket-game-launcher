import React, {
  useCallback, useEffect, useState,
} from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';
import styles from './styles.module.scss';
import {
  AppChannel, AppWindowName, AppWindowStateAction,
} from '$constants/misc';

const launcherIcon = require('$images/icon.png');

// передача функции openAppInfo в компонент означает, что окно с этим компонентом является главным
interface IProps {
  gameName: string,
  isResizable: boolean,
  isCloseBtnDisabled?: boolean,
  onClose: (event) => void,
  openAppInfo?: () => void,
}

export const Header: React.FunctionComponent<IProps> = ({
  gameName,
  isResizable,
  isCloseBtnDisabled = false,
  onClose,
  openAppInfo = null,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    ipcRenderer.on(AppChannel.CHANGE_WINDOW_SIZE_STATE, (evt, action: string) => {
      if (
        action === AppWindowStateAction.MAXIMIZE_WINDOW
        || action === AppWindowStateAction.UNMAXIMIZE_WINDOW
      ) {
        setIsMaximized(action === AppWindowStateAction.MAXIMIZE_WINDOW);
      }
    });

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.CHANGE_WINDOW_SIZE_STATE); };
  }, []);

  const onInfoAppClick = useCallback(() => {
    if (openAppInfo) {
      openAppInfo();
    }
  }, [openAppInfo]);

  const onMinimizeWindowClick = useCallback(() => {
    ipcRenderer.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      AppWindowStateAction.MINIMIZE_WINDOW,
      openAppInfo ? AppWindowName.MAIN : AppWindowName.DEV,
    );
  }, [openAppInfo]);

  const onMaximizeWindowClick = useCallback(() => {
    ipcRenderer.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      isMaximized ? AppWindowStateAction.UNMAXIMIZE_WINDOW : AppWindowStateAction.MAXIMIZE_WINDOW,
      openAppInfo ? AppWindowName.MAIN : AppWindowName.DEV,
    );
  }, [isMaximized, openAppInfo]);

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
        <p className={styles['header__game-name']}>{openAppInfo ? gameName : 'Экран разработчика'}</p>
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
                styles[`header__btn--${isMaximized ? 'unmaximize' : 'maximize'}`],
              )}
              onClick={onMaximizeWindowClick}
            >
              <span className={styles['header__btn-text']}>
                {isMaximized ? 'Unmaximize' : 'Maximize'}
              </span>
            </Button>
          )
        }
          <Button
            className={classNames(styles.header__btn, styles['header__btn--close'])}
            onClick={onCloseWindowBtnClick}
            isDisabled={isCloseBtnDisabled}
          >
            <span className={styles['header__btn-text']}>Close</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
