import React from 'react';

const styles = require('./styles.module.scss');

export const App = () => {
  return (
    <div>
      <h1 className={styles.default.title}>Hello World!</h1>
      <p>
          We are using Node.js <span id="node-version"></span>,
          Chromium <span id="chrome-version"></span>,
          and Electron <span id="electron-version"></span>.
      </p>
    </div>
  );
};
