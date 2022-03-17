import React from 'react';

import styles from './styles.module.scss';
import { IGameSettingsFile } from '$types/gameSettings';

interface IProps {
  file: IGameSettingsFile,
}

export const GameSettingsFileItem: React.FC<IProps> = ({
  file,
}) => (

  <li className={styles['game-settings-file__item']}>
    <p>{file.id}</p>
    <p>{file.name}</p>
    <p>{file.view}</p>
  </li>
);

