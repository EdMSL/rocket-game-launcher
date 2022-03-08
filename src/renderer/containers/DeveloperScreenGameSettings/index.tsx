import React, {
  ReactElement, useCallback, useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { DeveloperScreenController } from '$components/DeveloperScreenController';
import { IValidationErrors } from '$types/common';
import { useAppSelector } from '$store/store';

export const DeveloperScreenGameSettings: React.FC = () => {
  const isFirstLaunch = useAppSelector((state) => state.main.config.isFirstLaunch);
  // const [currentConfig, setCurrentConfig] = useState<IMainRootState['config']>(launcherConfig);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);

  const onSaveBtnClick = useCallback(() => {}, []);
  const onCancelBtnClick = useCallback(() => {}, []);
  const onResetBtnClick = useCallback(() => {}, []);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <form
      className="develover-screen__form"
    >
      <DeveloperScreenController
        isConfigChanged={isConfigChanged}
        isHaveValidationErrors={Object.keys(validationErrors).length > 0}
        isFirstLaunch={isFirstLaunch}
        onSaveBtnClick={onSaveBtnClick}
        onCancelBtnClick={onCancelBtnClick}
        onResetBtnClick={onResetBtnClick}
      />
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
        <div className={styles['developer-screen_game-settings']}>Data here</div>
      </Scrollbars>
    </form>
  );
};
