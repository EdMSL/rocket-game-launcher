import axios from 'axios';

const WAIT_TIME = 200;

export const createWaitForWebpackDevServer = (window) => {
  const waitForWebpackDevServer = (): void => {
    axios.get('http://localhost:8085/build/index.html').then(() => {
      window.loadURL('http://localhost:8085/build/index.html');
    }).catch(() => {
      setTimeout(waitForWebpackDevServer, WAIT_TIME);
    });
  };

  return waitForWebpackDevServer;
};
