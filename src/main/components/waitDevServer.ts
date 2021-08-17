import axios from 'axios';

const WAIT_TIME = 200;

export const createWaitForWebpackDevServer = (window): () => void => {
  const waitForWebpackDevServer = (): void => {
    axios.get('http://localhost:8081/build/index.html').then(() => {
      window.loadURL('http://localhost:8081/build/index.html');
    }).catch(() => {
      setTimeout(waitForWebpackDevServer, WAIT_TIME);
    });
  };

  return waitForWebpackDevServer;
};
