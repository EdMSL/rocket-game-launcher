import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './styles.module.scss';
import { IAppState } from '$store/store';
import { Message } from '$components/Message';
import { setMessages } from '$actions/main';
import { Button } from '$components/UI/Button';

export const Messages: React.FC = () => {
  const messages = useSelector((state: IAppState) => state.main.messages);

  const dispatch = useDispatch();

  const onDeleteAllMessagesBtnClick = useCallback(() => {
    dispatch(setMessages([]));
  }, [dispatch]);

  return (
    <div className={styles.messages}>
      {
        messages.length > 0 && (
          <React.Fragment>
            <Button
              className={styles.messages__btn}
              onClick={onDeleteAllMessagesBtnClick}
            >
              Close All
            </Button>
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
