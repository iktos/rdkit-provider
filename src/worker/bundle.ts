export const initWorker = () => {
  return new Worker(/* webpackChunkName: "rdk-worker" */ new URL('./worker.ts', import.meta.url));
};
