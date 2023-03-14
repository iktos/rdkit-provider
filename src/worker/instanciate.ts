import { broadcastLocalResponse } from './utils/broadcast';

export const initWorker = () => {
  const worker = new Worker(new URL(`${globalThis.origin}/rdk-worker.js`));
  worker.onmessage = broadcastLocalResponse;
  return worker;
};
