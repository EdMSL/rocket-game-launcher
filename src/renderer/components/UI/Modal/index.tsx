import FocusLock from 'react-focus-lock';
import React from 'react';

import { Button } from '$components/UI/Button';

interface IProps {
  children: React.ReactNode,
  onCloseBtnClick?: () => void,
}

export const Modal: React.FC<IProps> = ({
  children,
  onCloseBtnClick,
}) => (
  <FocusLock
    className="modal"
    as="section"
  >
    <div className="modal__overlay" />
    <div className="modal__block">
      <div className="modal__header">
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
      <div className="modal__content">
        {children}
      </div>
    </div>
  </FocusLock>
);
