import FocusLock from 'react-focus-lock';
import React from 'react';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';

interface IProps {
  children: React.ReactNode,
  modalParentClassname?: string,
  onCloseBtnClick?: () => void,
}

export const Modal: React.FC<IProps> = ({
  children,
  modalParentClassname = '',
  onCloseBtnClick,
}) => (
  <FocusLock
    className={classNames('modal', modalParentClassname && `${modalParentClassname}__modal`)}
    as="section"
  >
    <div className={classNames('modal__overlay')} />
    <div className={classNames('modal__block')}>
      <div className={classNames('modal__header')}>
        {
          onCloseBtnClick && (
            <Button
              className="modal__btn modal__btn--close"
              onClick={onCloseBtnClick}
            >
              <span className="modal__btn-text">
                Закрыть
              </span>
            </Button>
          )
    }
      </div>
      <div className={classNames('modal__content')}>
        {children}
      </div>
    </div>
  </FocusLock>
);
