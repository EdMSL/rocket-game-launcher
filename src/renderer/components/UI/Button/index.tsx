import React, { ReactElement, memo } from 'react';
import classNames from 'classnames';

interface IButtonProps {
  children: string | ReactElement | [string | ReactElement, string | ReactElement],
  className?: string,
  id?: string,
  isSubmit?: boolean,
  isDisabled?: boolean,
  tabIndex?: number,
  onClick?: (e: React.SyntheticEvent) => void,
}
export const Button: React.FunctionComponent<IButtonProps> = memo(({
  children,
  className = '',
  id,
  isSubmit,
  isDisabled,
  tabIndex = 0,
  onClick,
}) => (
  /* eslint-disable react/button-has-type */
  <button
    type={isSubmit ? 'submit' : 'button'}
    className={classNames('button', className)}
    disabled={isDisabled}
    id={id}
    tabIndex={tabIndex}
    onClick={isSubmit ? undefined : onClick}
  >
    {
      typeof children === 'string'
        ? <span className={`${className}-text`}>{children}</span>
        : children
    }
  </button>
));
