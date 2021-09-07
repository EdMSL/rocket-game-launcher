import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import styles from './styles.module.scss';
import { IGameSettingsRootState } from '$types/gameSettings';

interface IProps {
  usedFiles: IGameSettingsRootState['usedFiles'],
  gameOptions: IGameSettingsRootState['gameOptions'],
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
 * @param usedFiles Объект с параметрами из `state`, на основе которых сгенерированы
 * опции игровых настроек.
 * @param gameOptions Объект с обработанными опциями из `state`, готовыми для вывода.
*/
export const GameSettingsBlock: React.FC<IProps> = (
  usedFiles,
  gameOptions,
) => {
  const use = useCallback(() => {}, []);
  const { settingGroup } = useParams<{ [key: string]: string, }>();

  return (
    <div className={styles['game-settings-block__content']}>
      <span>
        {`GameSettingsBlock for ${settingGroup}`}
      </span>
    </div>
  );
};

