import React, { ReactElement, memo } from 'react';
import classNames from 'classnames';

interface IButtonProps {
  id?: string,
  name?: string,
  className?: string,
  isDisabled?: boolean,
  children: string | ReactElement | [string | ReactElement, string | ReactElement],
  isSubmit?: boolean,
  tabIndex?: number,
  btnPath?: string,
  btnArgs?: string,
  btnLabel?: string,
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
}
export const Button: React.FunctionComponent<IButtonProps> = memo(({
  id,
  children,
  name,
  className = '',
  isSubmit,
  isDisabled,
  tabIndex = 0,
  btnPath,
  btnArgs,
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
      disabled={Boolean(isDisabled)}
      id={id}
      name={name}
      tabIndex={tabIndex}
      data-path={btnPath}
      data-args={btnArgs}
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
