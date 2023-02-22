import { postWorkerJob } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { AlignmentDetails } from '../worker/utils/chem';
import { PayloadResponseType } from '../worker/worker';

export const getSvg = (
  worker: Worker,
  {
    smiles,
    drawingDetails,
    alignmentDetails,
  }: { smiles: string; drawingDetails: string; alignmentDetails?: AlignmentDetails },
) => {
  const key = `${smiles}-${drawingDetails}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SVG,
    key: key,
    payload: { smiles, drawingDetails, alignmentDetails },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_SVG'>);
};

export const getMoleculeDetails = (worker: Worker, { smiles }: { smiles: string }) => {
  const key = smiles;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS,
    key: key,
    payload: { smiles },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_MOLECULE_DETAILS'>);
};

export const getCanonicalFormForStructure = (worker: Worker, { structure }: { structure: string }) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE,
    key: key,
    payload: { structure },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_CANONICAL_FORM_FOR_STRUCTURE'>);
};

export const isValidSmiles = (worker: Worker, { smiles }: { smiles: string }) => {
  const key = smiles;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.IS_VALID_SMILES,
    key: key,
    payload: { smiles },
  }).then((msg) => msg.payload as PayloadResponseType<'IS_VALID_SMILES'>);
};

export const isValidSmarts = (worker: Worker, { smarts }: { smarts: string }) => {
  const key = smarts;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.IS_VALID_SMARTS,
    key: key,
    payload: { smarts },
  }).then((msg) => msg.payload as PayloadResponseType<'IS_VALID_SMARTS'>);
};

export const hasMatchingSubstructure = (
  worker: Worker,
  { smiles, substructure }: { smiles: string; substructure: string },
) => {
  const key = `${smiles}-${substructure}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.HAS_MATCHING_SUBSTRUCTURE,
    key: key,
    payload: { smiles, substructure },
  }).then((msg) => msg.payload as PayloadResponseType<'HAS_MATCHING_SUBSTRUCTURE'>);
};
export const getMatchingSubstructure = (
  worker: Worker,
  { structure, substructure }: { structure: string; substructure: string },
) => {
  const key = `${structure}-${substructure}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SUBSTRUCTURE_MATCH,
    key: key,
    payload: { structure, substructure },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_SUBSTRUCTURE_MATCH'>);
};
