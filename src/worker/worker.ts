import { cleanAllCache } from '../utils';
import { getActionLocalResponseIdentifier, RDKIT_WORKER_ACTIONS, WorkerMessage } from './actions';
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
      responsePayload = getMoleculeDetails(data.payload.smiles);
      break;
    case RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE:
      responsePayload = { canonicalForm: getCanonicalFormForStructure(data.payload.structure) };
      break;
    case RDKIT_WORKER_ACTIONS.GET_SVG:
      responsePayload = { svg: getSvg(data.payload.smiles, data.payload.drawingDetails) };
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMILES:
      responsePayload = { isValid: isValidSmiles(data.payload.smiles) };
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMARTS:
      responsePayload = { isValid: isValidSmarts(data.payload.smarts) };
      break;
    case RDKIT_WORKER_ACTIONS.HAS_MATCHING_SUBSTRUCTURE:
      responsePayload = {
        matching: hasMatchingSubstructure({
          smiles: data.payload.smiles,
          substructure: data.payload.substructure,
        }),
      };
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
