import { postWorkerJob } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';

export const getSvgWithHighlight = (
  worker: Worker,
  { smiles, drawingDetails }: { smiles: string; drawingDetails: string },
) => {
  const key = `${smiles}-${drawingDetails}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SVG,
    key: key,
    payload: {
      smiles: smiles,
      drawingDetails: drawingDetails,
    },
  }).then((msg) => msg.payload);
};

export const getMoleculeDetails = (worker: Worker, { smiles }: { smiles: string }) => {
  const key = smiles;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS,
    key: key,
    payload: {
      smiles: smiles,
    },
  }).then((msg) => msg.payload);
};

export const getCanonicalFormForStructure = (worker: Worker, { structure }: { structure: string }) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE,
    key: key,
    payload: {
      structure: structure,
    },
  }).then((msg) => msg.payload);
};
