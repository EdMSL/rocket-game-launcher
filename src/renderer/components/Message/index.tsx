import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IMessage } from '$reducers/main';
import { Button } from '$components/UI/Button';
import { deleteMessages } from '$actions/main';

interface IProps {
  message: IMessage,
}

export const Message: React.FC<IProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();

  const onExpandBtnClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const onCloseBtnClick = useCallback(() => {
    dispatch(deleteMessages([message.id]));
  }, [dispatch, message]);

  return (
    <li
      key={message.id}
      className={styles.message}
    >
      <div className={styles.message__header}>
        <Button
          className={classNames(
            styles.message__btn,
            styles['message__btn--expand'],
          )}
          onClick={onExpandBtnClick}
        >
          <p className={styles['message__btn-text']}>Expand</p>
        </Button>
        <Button
          className={classNames(styles.message__btn, styles['message__btn--close'])}
          onClick={onCloseBtnClick}
        >
          <p className={styles['message__btn-text']}>Close</p>
        </Button>
      </div>
      <p className={classNames(
        styles.message__content,
        isExpanded && styles['message__content--open'],
      )}
      >
        {message.text}
      </p>
    </li>
  );
};
