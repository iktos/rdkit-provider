import { broadcastLocalResponse } from './utils/broadcast';

export const initWorker = () => {
  const worker = new Worker(/* webpackChunkName: "rdk-worker" */ new URL('./worker.js', import.meta.url));
  // broadcast worker responses to window to allow for processing multi jobs/responses in parallel
  worker.onmessage = broadcastLocalResponse;
  return worker;
};

export * from './utils';
