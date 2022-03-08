import React, {
  ReactElement, useCallback, useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { DeveloperScreenController } from '$components/DeveloperScreenController';
import { IValidationErrors } from '$types/common';
import { useAppSelector } from '$store/store';
import { IGameSettingsRootState } from '$types/gameSettings';

export const DeveloperScreenGameSettings: React.FC = () => {
  const settingsFiles = useAppSelector((state) => state.gameSettings.gameSettingsFiles);
  const settingsGroups = useAppSelector((state) => state.gameSettings.gameSettingsGroups);
  const baseFilesEncoding = useAppSelector((state) => state.gameSettings.baseFilesEncoding);
  const isFirstLaunch = useAppSelector((state) => state.main.config.isFirstLaunch);

  const [currentSettingsFiles, setCurrentSettingsFiles] = useState<IGameSettingsRootState['gameSettingsFiles']>(settingsFiles);//eslint-disable-line max-len
  const [currentSettingsGroups, setCurrentSettingsGroups] = useState<IGameSettingsRootState['gameSettingsGroups']>(settingsGroups);//eslint-disable-line max-len
  const [currentBaseFilesEncoding, setCurrentBaseFilesEncoding] = useState<IGameSettingsRootState['baseFilesEncoding']>(baseFilesEncoding);//eslint-disable-line max-len
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
        <div className={styles['developer-screen_game-settings']}>
          <div className="developer-screen__block">Data here</div>
        </div>
      </Scrollbars>
    </form>
  );
};
