import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import { Message } from '$components/Message';
import { setMessages } from '$actions/main';
import { Button } from '$components/UI/Button';

export const Messages: React.FC = () => {
  const messages = useAppSelector((state) => state.main.messages);

  const dispatch = useDispatch();

  const onDeleteAllMessagesBtnClick = useCallback(() => {
    dispatch(setMessages([]));
  }, [dispatch]);

  return (
    <div className={styles.messages}>
      {
        messages.length > 0 && (
          <React.Fragment>
            {
              messages.length > 1 && (
                <Button
                  className={styles.messages__btn}
                  onClick={onDeleteAllMessagesBtnClick}
                >
                  Close All
                </Button>
              )
            }
            <ul className={styles.messages__list}>
              {messages.map((currentMessage) => (
                <Message
                  key={currentMessage.id}
                  message={currentMessage}
                />
              ))}
            </ul>
          </React.Fragment>
        )
      }
    </div>
  );
};
