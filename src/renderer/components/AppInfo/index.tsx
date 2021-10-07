import React, { useCallback } from 'react';

import styles from './styles.module.scss';
import { openSite } from '$utils/process';

export const AppInfo: React.FC = () => {
  const onOpenSiteBtnClick = useCallback((event) => {
    event.preventDefault();
    openSite(event.currentTarget.href);
  }, []);

  return (
    <div className={styles['app-info__container']}>
      <p className={styles['app-info__title']}>Rocket Game Launcher</p>
      <p>Version: 1.1.0</p>
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
