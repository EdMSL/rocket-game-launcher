import axios from 'axios';

const WAIT_TIME = 200;

export const createWaitForWebpackDevServer = (window, url): () => void => {
  const waitForWebpackDevServer = (): void => {
    axios.get(url).then(() => {
      window.loadURL(url);
    }).catch(() => {
      setTimeout(waitForWebpackDevServer, WAIT_TIME);
    });
  };

  return waitForWebpackDevServer;
};
