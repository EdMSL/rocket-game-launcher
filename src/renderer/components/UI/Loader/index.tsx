import React from 'react';
import classNames from 'classnames';

export const Loader: React.FunctionComponent<{
  wrapperClassname?: string,
  loaderClassname?: string,
}> = ({
  wrapperClassname = null,
  loaderClassname = null,
}) => (
  <div className={classNames('loader__wrapper', wrapperClassname)}>
    <div className={classNames('loader', loaderClassname)} />
  </div>
);
