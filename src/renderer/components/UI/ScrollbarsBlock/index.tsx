import React, { ReactElement, ReactNode } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

interface IProps {
  children: ReactNode,
}

/* eslint-disable react/jsx-props-no-spreading */
export const ScrollbarsBlock: React.FC<IProps> = ({ children }) => (
  <Scrollbars
    autoHeight
    autoHide
    autoHeightMax="100%"
    hideTracksWhenNotNeeded
    renderTrackVertical={(props): ReactElement => (
      <div
        {...props}
        className="scrollbar__track"
      />
    )}
    renderThumbVertical={(props): ReactElement => (
      <div
        {...props}
        className="scrollbar__thumb"
      />
    )}
  >
    {children}
  </Scrollbars>
);
