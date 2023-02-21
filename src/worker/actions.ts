import { RDKitProviderCacheOptions } from '../contexts';

export const RDKIT_WORKER_ACTIONS = {
  INIT_RDKIT_MODULE: 'INIT_RDKIT_MODULE',
  LOCAL_RESPONSE: 'LOCAL_RESPONSE',
  BROADCASTED_RESPONSE: 'BROADCASTED_RESPONSE',
  GET_SVG: 'GET_SVG',
  GET_MOLECULE_DETAILS: 'GET_MOLECULE_DETAILS',
  GET_CANONICAL_FORM_FOR_STRUCTURE: 'GET_CANONICAL_FORM_FOR_STRUCTURE',
  IS_VALID_SMILES: 'IS_VALID_SMILES',
  IS_VALID_SMARTS: 'IS_VALID_SMARTS',
  HAS_MATCHING_SUBSTRUCTURE: 'HAS_MATCHING_SUBSTRUCTURE',
  TERMINATE: 'TERMINATE',
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

export type WorkerMessage = WorkerMessageNarrower & WorkerMessageGerneric;

export type WorkerMessageNarrower =
  | {
      actionType: 'INIT_RDKIT_MODULE';
      key: string;
      payload: { cache: RDKitProviderCacheOptions };
    }
  | {
      actionType: 'GET_SVG';
      key: string;
      payload: { smiles: string; drawingDetails: string };
    }
  | {
      actionType: 'GET_MOLECULE_DETAILS';
      key: string;
      payload: { smiles: string };
    }
  | {
      actionType: 'GET_CANONICAL_FORM_FOR_STRUCTURE';
      key: string;
      payload: { structure: string };
    }
  | {
      actionType: 'IS_VALID_SMILES';
      key: string;
      payload: { smiles: string };
    }
  | {
      actionType: 'IS_VALID_SMARTS';
      key: string;
      payload: { smarts: string };
    }
  | {
      actionType: 'HAS_MATCHING_SUBSTRUCTURE';
      key: string;
      payload: { smiles: string; substructure: string };
    }
  | {
      actionType: 'TERMINATE';
      key: string;
    };

export type ActionWorkerMessageNarrowerApplier<ActionType extends RDKIT_WORKER_ACTIONS_TYPE> = {
  actionType: ActionType;
  key: string;
} & WorkerMessageNarrower;

interface WorkerMessageGerneric {
  actionType: RDKIT_WORKER_ACTIONS_TYPE;
  key: string;
  payload?: unknown;
}
