import { getActionResponseIdentifier, WorkerMessage } from '../actions';

export const postWorkerJob = async (worker: Worker, message: WorkerMessage): Promise<WorkerMessage> => {
  return new Promise((resolve, _) => {
    worker.postMessage(message);
    const onReceive = ({ data: response }: MessageEvent<WorkerMessage>) => {
      if (response.actionType === getActionResponseIdentifier(message.actionType) && response.key === message.key) {
        removeEventListener('message', onReceive);
        resolve(response);
      }
    };
    addEventListener('message', onReceive);
  });
};
