import React, { useCallback } from 'react';

import styles from './styles.module.scss';
import { IGameSettingsRootState } from '$types/gameSettings';

interface IProps {
  usedFiles: IGameSettingsRootState['usedFiles'],
  gameOptions: IGameSettingsRootState['gameOptions'],
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
*/
export const GameSettingsBlock: React.FC<IProps> = (
  usedFiles,
  gameOptions,
) => {
  const use = useCallback(() => {}, []);

  return (
    <div className={styles['game-settings-block__content']}>
      <span>GameSettingsBlock</span>
    </div>
  );
};

