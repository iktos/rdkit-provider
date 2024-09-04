/*
  MIT License

  Copyright (c) 2023 Iktos

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import { postWorkerJob } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { AlignmentDetails, DrawingDetails, MolNotation, SourceMolNotation } from '../worker/utils/chem';
import { PayloadResponseType } from '../worker/worker';

export const getSvg = (
  worker: Worker,
  {
    smiles,
    drawingDetails,
    alignmentDetails,
  }: { smiles: string; drawingDetails?: DrawingDetails; alignmentDetails?: AlignmentDetails },
) => {
  const key = `${smiles}-${JSON.stringify(drawingDetails)}-${JSON.stringify(alignmentDetails)}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SVG,
    key: key,
    payload: { smiles, drawingDetails, alignmentDetails },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_SVG'>);
};

export const getSvgFromSmarts = (
  worker: Worker,
  { smarts, width, height }: { smarts: string; width: number; height: number },
) => {
  const key = `${smarts}-${width}-${height}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SVG_FROM_SMARTS,
    key: key,
    payload: { smarts, width, height },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_SVG_FROM_SMARTS'>);
};

export function getMoleculeDetails(
  worker: Worker,
  params: { smiles: string; returnFullDetails: true },
): Promise<PayloadResponseType<'GET_MOLECULE_DETAILS'>>;
export function getMoleculeDetails(
  worker: Worker,
  params: { smiles: string; returnFullDetails?: false | undefined },
): Promise<PayloadResponseType<'DEPRECATED_GET_MOLECULE_DETAILS'>>;
export function getMoleculeDetails( // returnFullDetails = false is deprecated, returnFullDetails will be removed in v3 and returnFullDetails = true will be the default behavior
  worker: Worker,
  { smiles, returnFullDetails = false }: { smiles: string; returnFullDetails?: boolean },
) {
  const key = smiles;
  if (!returnFullDetails) {
    return postWorkerJob(worker, {
      actionType: RDKIT_WORKER_ACTIONS.DEPRECATED_GET_MOLECULE_DETAILS,
      key,
      payload: { smiles },
    }).then((msg) => msg.payload as PayloadResponseType<'DEPRECATED_GET_MOLECULE_DETAILS'>);
  }

  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS,
    key,
    payload: { smiles },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_MOLECULE_DETAILS'>);
}

export const getCanonicalFormForStructure = (
  worker: Worker,
  { structure, molNotation, useQMol }: { structure: string; molNotation?: MolNotation; useQMol?: boolean },
) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE,
    key: key,
    payload: { structure, molNotation, useQMol },
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

export const isValidMolBlock = (worker: Worker, { mdl }: { mdl: string }) => {
  const key = mdl;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.IS_VALID_MOLBLOCK,
    key,
    payload: { mdl },
  }).then((msg) => msg.payload as PayloadResponseType<'IS_VALID_MOLBLOCK'>);
};

export const convertMolNotation = (
  worker: Worker,
  {
    moleculeString,
    targetNotation,
    sourceNotation,
    useQMol,
  }: { moleculeString: string; targetNotation: MolNotation; sourceNotation?: SourceMolNotation; useQMol?: boolean },
) => {
  const key = `${moleculeString}-to-${targetNotation}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.CONVERT_MOL_NOTATION,
    key,
    payload: { moleculeString, targetNotation, sourceNotation, useQMol },
  }).then((msg) => msg.payload as PayloadResponseType<'CONVERT_MOL_NOTATION'>);
};

export const removeHs = (worker: Worker, { structure }: { structure: string }) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.REMOVE_HS,
    key,
    payload: { structure },
  }).then((msg) => msg.payload as PayloadResponseType<'REMOVE_HS'>);
};

export const addHs = (worker: Worker, { structure }: { structure: string }) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.ADD_HS,
    key,
    payload: { structure },
  }).then((msg) => msg.payload as PayloadResponseType<'ADD_HS'>);
};

export const getNewCoords = (
  worker: Worker,
  { structure, useCoordGen }: { structure: string; useCoordGen?: boolean },
) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_NEW_COORDS,
    key,
    payload: { structure, useCoordGen },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_NEW_COORDS'>);
};

export const getStereoTags = (worker: Worker, { structure }: { structure: string }) => {
  const key = structure;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_STEREO_TAGS,
    key,
    payload: { structure },
  }).then((msg) => msg.payload as PayloadResponseType<'GET_STEREO_TAGS'>);
};
