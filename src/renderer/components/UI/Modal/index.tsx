import FocusLock from 'react-focus-lock';
import React from 'react';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';

interface IProps {
  children: React.ReactNode,
  modalBlockClassname?: string,
  modalHeaderClassname?: string,
  modalContentClassname?: string,
  onCloseBtnClick?: () => void,
}

export const Modal: React.FC<IProps> = ({
  children,
  modalBlockClassname = '',
  modalHeaderClassname = '',
  modalContentClassname = '',
  onCloseBtnClick,
}) => (
  <FocusLock
    className="modal"
    as="section"
  >
    <div className="modal__overlay" />
    <div className={classNames('modal__block', modalBlockClassname)}>
      <div className={classNames('modal__header', modalHeaderClassname)}>
        {
          onCloseBtnClick && (
            <Button
              className="modal__btn"
              onClick={onCloseBtnClick}
            >
              Закрыть
            </Button>
          )
    }
      </div>
      <div className={classNames('modal__content', modalContentClassname)}>
        {children}
      </div>
    </div>
  </FocusLock>
);
