import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import { Message } from '$components/Message';
import { setMessages } from '$actions/main';
import { Button } from '$components/UI/Button';

export const Messages: React.FC = () => {
  const messages = useAppSelector((state) => state.main.messages);

  const dispatch = useDispatch();

  const { pathname } = useLocation<{ [key: string]: string, }>();

  const filteredMessages = messages.filter((message) => pathname.includes(message.window));

  const onDeleteAllMessagesBtnClick = useCallback(() => {
    const clearedMessages = messages.filter((message) => !pathname.includes(message.window));

    dispatch(setMessages(clearedMessages));
  }, [dispatch, pathname, messages]);

  return (
    <div className={styles.messages}>
      {
        filteredMessages.length > 0 && (
          <React.Fragment>
            {
              filteredMessages.length > 1 && (
                <Button
                  className={styles.messages__btn}
                  onClick={onDeleteAllMessagesBtnClick}
                >
                  Close All
                </Button>
              )
            }
            <ul className={styles.messages__list}>
              {filteredMessages.map((currentMessage) => (
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
