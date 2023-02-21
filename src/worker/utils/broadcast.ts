import { isLocalResponse, localResponseToResponse, WorkerMessage } from '../actions';

export const broadcastLocalResponse = (msg: MessageEvent<WorkerMessage>) => {
  const { actionType } = msg.data;
  if (isLocalResponse(actionType)) {
    postMessage({
      ...msg.data,
      actionType: localResponseToResponse(actionType),
    });
    return;
  }
};
