import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { deleteMessages } from '$actions/main';
import { IUserMessage } from '$types/common';

interface IProps {
  message: IUserMessage,
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
      className={classNames(
        styles.message,
        message.type === 'error' && styles['message--error'],
        message.type === 'warning' && styles['message--warning'],
        message.type === 'success' && styles['message--success'],
      )}
    >
      <div className={styles.message__header}>
        <Button
          className={classNames(
            styles.message__btn,
            styles['message__btn--expand'],
          )}
          onClick={onExpandBtnClick}
        >
          <span className={styles['message__btn-text']}>Expand</span>
        </Button>
        <Button
          className={classNames(styles.message__btn, styles['message__btn--close'])}
          onClick={onCloseBtnClick}
        >
          <span className={styles['message__btn-text']}>Close</span>
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
