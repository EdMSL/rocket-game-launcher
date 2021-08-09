import React from 'react';
import { useSelector } from 'react-redux';

import styles from './styles.module.scss';
import { IAppState } from '$store/store';

export const Messages: React.FC = () => {
  const messages = useSelector((state: IAppState) => state.main.messages);

  return (
    <div className={styles.messages}>
      {
        messages.length > 0 && (
          <ul>
            {messages.map((currentMessage) => (
              <div>
                <p>{currentMessage.text}</p>
              </div>
            ))}
          </ul>

        )
      }
    </div>
  );
};
