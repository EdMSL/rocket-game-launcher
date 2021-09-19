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
    <div className={classNames(
      'modal__overlay',
      modalParentClassname && `${modalParentClassname}__modal-overlay`,
    )}
    />
    <div className={classNames(
      'modal__block',
      modalParentClassname && `${modalParentClassname}__modal-block`,
    )}
    >
      <div className={classNames(
        'modal__header',
        modalParentClassname && `${modalParentClassname}__modal-header`,
      )}
      >
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
      <div className={classNames(
        'modal__content',
        modalParentClassname && `${modalParentClassname}__modal-content`,
      )}
      >
        {children}
      </div>
    </div>
  </FocusLock>
);
