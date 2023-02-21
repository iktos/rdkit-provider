export const initWorker = () => {
  return new Worker(/* webpackChunkName: "rdk-worker" */ new URL('./worker.js', import.meta.url));
};

export * from './utils';
