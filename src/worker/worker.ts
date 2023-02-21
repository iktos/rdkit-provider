import { cleanAllCache } from '../utils';
import {
  getActionLocalResponseIdentifier,
  RDKIT_WORKER_ACTIONS,
  RDKIT_WORKER_ACTIONS_TYPE,
  WorkerMessage,
} from './actions';
import { initRdkit } from './utils/initRDKit';
import {
  getCanonicalFormForStructure,
  getMoleculeDetails,
  getSvg,
  hasMatchingSubstructure,
  isValidSmarts,
  isValidSmiles,
} from './utils/molecule';

addEventListener('message', async ({ data }: { data: WorkerMessage }) => {
  let responsePayload;
  switch (data.actionType) {
    case RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE:
      await initRdkit({ cache: data.payload?.cache });
      break;
    case RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS:
      responsePayload = getMoleculeDetails(data.payload.smiles) satisfies PayloadResponseType<'GET_MOLECULE_DETAILS'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE:
      responsePayload = {
        canonicalForm: getCanonicalFormForStructure(data.payload.structure),
      } satisfies PayloadResponseType<'GET_CANONICAL_FORM_FOR_STRUCTURE'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_SVG:
      responsePayload = {
        svg: getSvg(data.payload.smiles, data.payload.drawingDetails),
      } satisfies PayloadResponseType<'GET_SVG'>;
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMILES:
      responsePayload = {
        isValid: isValidSmiles(data.payload.smiles),
      } satisfies PayloadResponseType<'IS_VALID_SMILES'>;
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMARTS:
      responsePayload = {
        isValid: isValidSmarts(data.payload.smarts),
      } satisfies PayloadResponseType<'IS_VALID_SMARTS'>;
      break;
    case RDKIT_WORKER_ACTIONS.HAS_MATCHING_SUBSTRUCTURE:
      responsePayload = {
        matching: hasMatchingSubstructure({
          smiles: data.payload.smiles,
          substructure: data.payload.substructure,
        }),
      } satisfies PayloadResponseType<'HAS_MATCHING_SUBSTRUCTURE'>;
      break;
    case RDKIT_WORKER_ACTIONS.TERMINATE:
      cleanAllCache();
      self.close();
      break;
    default:
      return;
  }
  postMessage({
    actionType: getActionLocalResponseIdentifier(data.actionType),
    payload: responsePayload,
    key: data.key,
  });
});

export type PayloadResponseType<ActionType extends RDKIT_WORKER_ACTIONS_TYPE> = ActionType extends 'GET_SVG'
  ? { svg: string | null }
  : ActionType extends 'IS_VALID_SMILES'
  ? { isValid: boolean }
  : ActionType extends 'IS_VALID_SMARTS'
  ? { isValid: boolean }
  : ActionType extends 'GET_CANONICAL_FORM_FOR_STRUCTURE'
  ? { canonicalForm: string | null }
  : ActionType extends 'HAS_MATCHING_SUBSTRUCTURE'
  ? { matching: boolean }
  : ActionType extends 'GET_MOLECULE_DETAILS'
  ? {
      numAtoms: number;
      numRings: number;
    } | null
  : never;
