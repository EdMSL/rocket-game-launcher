import FocusLock from 'react-focus-lock';
import React from 'react';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';

interface IProps {
  children: React.ReactNode,
  modalClassname?: string,
  modalOverlayClassname?: string,
  modalBlockClassname?: string,
  modalHeaderClassname?: string,
  modalContentClassname?: string,
  onCloseBtnClick?: () => void,
}

export const Modal: React.FC<IProps> = ({
  children,
  modalClassname = '',
  modalOverlayClassname = '',
  modalBlockClassname = '',
  modalHeaderClassname = '',
  modalContentClassname = '',
  onCloseBtnClick,
}) => (
  <FocusLock
    className={classNames('modal', modalClassname)}
    as="section"
  >
    <div className={classNames('modal__overlay', modalOverlayClassname)} />
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
