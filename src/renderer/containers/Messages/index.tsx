import React from 'react';
import { useSelector } from 'react-redux';

import styles from './styles.module.scss';
import { IAppState } from '$store/store';
import { Message } from '$components/Message';

export const Messages: React.FC = () => {
  const messages = useSelector((state: IAppState) => state.main.messages);

  return (
    <div className={styles.messages}>
      {
        messages.length > 0 && (
          <ul className={styles.messages__list}>
            {messages.map((currentMessage) => <Message message={currentMessage} />)}
          </ul>

        )
      }
    </div>
  );
};
