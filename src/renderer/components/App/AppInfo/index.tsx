import React, { useCallback } from 'react';

import styles from './styles.module.scss';
import { openSite } from '$utils/process';

const launcherIcon = require('$images/icon.png');

interface IProps {
  launcherVersion: string,
}

export const AppInfo: React.FC<IProps> = ({ launcherVersion }) => {
  const onOpenSiteBtnClick = useCallback((event) => {
    event.preventDefault();
    openSite(event.currentTarget.href);
  }, []);

  return (
    <div className={styles['app-info__container']}>
      <div className={styles['app-info__block']}>
        <img
          className={styles['app-info__logo']}
          src={launcherIcon}
          alt="game logo"
        />
        <div>
          <p className={styles['app-info__title']}>Rocket Game Launcher</p>
          <p>{`Version: ${launcherVersion}`}</p>
        </div>
      </div>
      <p>
        Created by
        <a
          href="https://github.com/EdMSL"
          className={styles['app-info__link']}
          onClick={onOpenSiteBtnClick}
        >
          Ed_MSL
        </a>
        with support of OATeam from
        <a
          href="https://rubarius.ru"
          className={styles['app-info__link']}
          onClick={onOpenSiteBtnClick}
        >
          Rubarius.ru
        </a>
      </p>

    </div>
  );
};
