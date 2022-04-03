import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { Message } from '$components/Message';
import { Button } from '$components/UI/Button';
import { IUserMessage } from '$types/common';

interface IProps {
  messages: IUserMessage[],
  setMessages,
}

export const Messages: React.FC<IProps> = ({
  messages,
  setMessages,
}) => {
  const dispatch = useDispatch();

  const onDeleteAllMessagesBtnClick = useCallback(() => {
    dispatch(setMessages([]));
  }, [dispatch, setMessages]);

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
