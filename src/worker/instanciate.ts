import { broadcastLocalResponse } from './utils/broadcast';

export const initWorker = (rdkitWorkerPath?: string) => {
  const path = rdkitWorkerPath || '/rdkit-worker.js';
  const worker = new Worker(new URL(path, globalThis.origin));
  worker.onmessage = broadcastLocalResponse;
  return worker;
};
