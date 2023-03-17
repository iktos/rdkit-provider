import { broadcastLocalResponse } from './utils/broadcast';

export const initWorker = () => {
  const worker = new Worker(new URL(`${globalThis.origin}/rdkit-worker.js`));
  worker.onmessage = broadcastLocalResponse;
  return worker;
};
