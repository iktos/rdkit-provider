export const initWorker = () => {
  return new Worker(/* webpackChunkName: "rdkit-worker" */ new URL('./worker.ts', import.meta.url));
};
