import React, { useCallback } from 'react';

import styles from './styles.module.scss';

interface IProps {
  id: string,
  description?: string,
  currentHintId: string,
  onHover: (id: string) => void,
  onLeave: () => void,
}

export const GameSettingsHintBlock: React.FunctionComponent<IProps> = ({
  id,
  description,
  currentHintId,
  onHover,
  onLeave,
}) => {
  const onHintIconHover = useCallback(() => {
    onHover(id);
  }, [onHover, id]);

  const onHintIconLeave = useCallback(() => {
    onLeave();
  }, [onLeave]);

  return (
    <React.Fragment>
      {
        description && (
          <div
            className={styles['game-settings-hint__icon']}
            onMouseEnter={onHintIconHover}
            onMouseLeave={onHintIconLeave}
          >
            {
              currentHintId === id && (
                <div
                  className={styles['game-settings-hint__block']}
                >
                  <p className={styles['game-settings-hint__text']}>{description}</p>
                </div>
              )
            }
          </div>
        )
      }
    </React.Fragment>
  );
};
