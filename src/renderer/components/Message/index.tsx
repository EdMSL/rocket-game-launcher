import React, { useCallback, useState } from 'react';

import styles from './styles.module.scss';
import { IMessage } from '$reducers/main';
import { Button } from '$components/UI/Button';

interface IProps {
  message: IMessage,
}

export const Message: React.FC<IProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onExpandBtnClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <li
      key={message.id}
      className={styles.message}
    >
      <div className={styles.message__header}>
        <Button
          className={styles.message__btn}
          onClick={onExpandBtnClick}
        >
          <span className={styles['message__btn-text']}>Close</span>
        </Button>
      </div>
      <p className={styles.message__text}>{message.text}</p>
    </li>
  );
};
