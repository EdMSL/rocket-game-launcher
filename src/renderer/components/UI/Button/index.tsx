import React, { ReactElement, memo } from 'react';
import classNames from 'classnames';

interface IButtonProps {
  children: string | ReactElement | [string | ReactElement, string | ReactElement],
  className?: string,
  id?: string,
  isSubmit?: boolean,
  isDisabled?: boolean,
  tabIndex?: number,
  btnPath?: string,
  btnLabel?: string,
  onClick?: (e: React.SyntheticEvent) => void,
}
export const Button: React.FunctionComponent<IButtonProps> = memo(({
  children,
  className = '',
  id,
  isSubmit,
  isDisabled,
  tabIndex = 0,
  btnPath,
  btnLabel,
  onClick,
}) => {
  let textClassname = '';

  const classNameArr = className.split(' ');
  if (classNameArr.length > 1) {
    textClassname = classNameArr[classNameArr.length - 1];
  } else {
    textClassname = className;
  }

  return (
  /* eslint-disable react/button-has-type */
    <button
      type={isSubmit ? 'submit' : 'button'}
      className={classNames('button', className)}
      disabled={isDisabled}
      id={id}
      tabIndex={tabIndex}
      data-path={btnPath}
      data-label={btnLabel}
      onClick={isSubmit ? undefined : onClick}
    >
      {
      typeof children === 'string'
        ? <span className={`${textClassname}-text`}>{children}</span>
        : children
    }
    </button>
  );
});
