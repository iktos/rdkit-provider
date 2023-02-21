export const RDKIT_WORKER_ACTIONS = {
  INIT_RDKIT_MODULE: 'INIT_RDKIT_MODULE',
  LOCAL_RESPONSE: 'LOCAL_RESPONSE',
  BROADCASTED_RESPONSE: 'BROADCASTED_RESPONSE',
  GET_SVG: 'GET_SVG',
} as const;

type ValueOf<T> = T[keyof T];
export type RDKIT_WORKER_ACTIONS_TYPE = ValueOf<typeof RDKIT_WORKER_ACTIONS>;

const RESPONSE_SUFFIX = '_RESPONSE';
const LOCAL_RESPONSE_SUFFIX = '_LOCAL_RESPONSE';
export const getActionResponseIdentifier = (action: RDKIT_WORKER_ACTIONS_TYPE) => action + RESPONSE_SUFFIX;
export const getActionLocalResponseIdentifier = (action: RDKIT_WORKER_ACTIONS_TYPE) => action + LOCAL_RESPONSE_SUFFIX;
export const isLocalResponse = (action: RDKIT_WORKER_ACTIONS_TYPE) => action.includes('LOCAL_RESPONSE');
export const localResponseToResponse = (action: RDKIT_WORKER_ACTIONS_TYPE) =>
  action.replace('LOCAL_RESPONSE', 'RESPONSE');

export interface WorkerMessage {
  // TODO make define a type per action to allow for ts narrowing and infering return type in postJob
  actionType: RDKIT_WORKER_ACTIONS_TYPE;
  key: string;
  payload?: Record<string, unknown>;
}
