import { RDKitProviderCacheOptions } from '../contexts';
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
      // TODO remove as ... once narrowing is implemented
      await initRdkit({ cache: data.payload?.cache as RDKitProviderCacheOptions });
      break;
    case RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS:
      if (!data.payload) return;
      responsePayload = getMoleculeDetails(data.payload.smiles as string);
      break;
    case RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE:
      if (!data.payload) return;
      responsePayload = { canonicalForm: getCanonicalFormForStructure(data.payload.structure as string) };
      break;
    case RDKIT_WORKER_ACTIONS.GET_SVG:
      if (!data.payload) return;
      responsePayload = { svg: getSvg(data.payload.smiles as string, data.payload.drawingDetails as string) };
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMILES:
      if (!data.payload) return;
      responsePayload = { isValid: isValidSmiles(data.payload.smiles as string) };
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMARTS:
      if (!data.payload) return;
      responsePayload = { isValid: isValidSmarts(data.payload.smarts as string) };
      break;
    case RDKIT_WORKER_ACTIONS.HAS_MATCHING_SUBSTRUCTURE:
      if (!data.payload) return;
      responsePayload = {
        matching: hasMatchingSubstructure({
          smiles: data.payload.smiles as string,
          substructure: data.payload.substructure as string,
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
