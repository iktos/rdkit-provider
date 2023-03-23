import { broadcastLocalResponse } from './utils/broadcast';

export const initWorker = (rdkitWorkerPath?: string) => {
  const worker = new Worker(new URL(rdkitWorkerPath ?? `${globalThis.origin}/rdkit-worker.js`));
  worker.onmessage = broadcastLocalResponse;
  return worker;
};
