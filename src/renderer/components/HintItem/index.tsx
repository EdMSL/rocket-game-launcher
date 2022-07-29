import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface IProps {
  description: string,
  className?: string,
  direction?: 'right'|'left',
}

export const HintItem: React.FunctionComponent<IProps> = ({
  description,
  direction = 'right',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onHintIconHover = useCallback(() => {
    setIsVisible(true);
  }, [setIsVisible]);

  const onHintIconLeave = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  return (
    <div
      className={classNames(styles.hint__icon, className)}
      onMouseEnter={onHintIconHover}
      onMouseLeave={onHintIconLeave}
    >
      {
        isVisible && (
          <div
            className={classNames(
              styles.hint__block,
              direction === 'left' && styles['hint__block--left'],
            )}
          >
            <p className={styles.hint__text}>{description}</p>
          </div>
        )
      }
    </div>
  );
};
