import React, { useCallback, useState } from 'react';

import styles from './styles.module.scss';

interface IProps {
  description: string,
}

export const HintItem: React.FunctionComponent<IProps> = ({
  description,
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
      className={styles.hint__icon}
      onMouseEnter={onHintIconHover}
      onMouseLeave={onHintIconLeave}
    >
      {
        isVisible && (
          <div
            className={styles.hint__block}
          >
            <p className={styles.hint__text}>{description}</p>
          </div>
        )
      }
    </div>
  );
};
