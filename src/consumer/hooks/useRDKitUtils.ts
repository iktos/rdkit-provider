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

import {
  addHs,
  convertMolNotation,
  getMoleculeDetails as getMoleculeDetailsAction,
  getNewCoords,
  getSvg,
  hasMatchingSubstructure,
  isValidMolBlock,
  isValidSmarts,
  isValidSmiles,
  removeHs,
  getStereoTags,
  isChiral,
  getMorganFp,
} from '../actions';
import { ActionWorkerMessageNarrowerApplier } from '../../worker/actions';

import { useRDKit } from '../../hooks/useRDKit';
import { PayloadResponseType } from '../../worker/worker';

type RDKitUtilsReady = {
  isReady: true;
  isValidSmiles: (
    params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMILES'>['payload'],
  ) => Promise<PayloadResponseType<'IS_VALID_SMILES'>>;
  isValidSmarts: (
    params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMARTS'>['payload'],
  ) => Promise<PayloadResponseType<'IS_VALID_SMARTS'>>;
  isChiral: (
    params: ActionWorkerMessageNarrowerApplier<'IS_CHIRAL'>['payload'],
  ) => Promise<PayloadResponseType<'IS_CHIRAL'>>;
  getMorganFp: (
    params: ActionWorkerMessageNarrowerApplier<'GET_MORGAN_FP'>['payload'],
  ) => Promise<PayloadResponseType<'GET_MORGAN_FP'>>;
  hasMatchingSubstructure: (
    params: ActionWorkerMessageNarrowerApplier<'HAS_MATCHING_SUBSTRUCTURE'>['payload'],
  ) => Promise<PayloadResponseType<'HAS_MATCHING_SUBSTRUCTURE'>>;
  getMoleculeDetails: {
    (params: { smiles: string; returnFullDetails: true }): Promise<PayloadResponseType<'GET_MOLECULE_DETAILS'>>;
    (params: { smiles: string; returnFullDetails?: false | undefined }): Promise<
      PayloadResponseType<'DEPRECATED_GET_MOLECULE_DETAILS'>
    >;
  };
  getSvg: (params: ActionWorkerMessageNarrowerApplier<'GET_SVG'>['payload']) => Promise<PayloadResponseType<'GET_SVG'>>;
  isValidMolblock: (
    params: ActionWorkerMessageNarrowerApplier<'IS_VALID_MOLBLOCK'>['payload'],
  ) => Promise<PayloadResponseType<'IS_VALID_MOLBLOCK'>>;
  convertMolNotation: (
    params: ActionWorkerMessageNarrowerApplier<'CONVERT_MOL_NOTATION'>['payload'],
  ) => Promise<PayloadResponseType<'CONVERT_MOL_NOTATION'>>;
  addHs: (params: ActionWorkerMessageNarrowerApplier<'ADD_HS'>['payload']) => Promise<PayloadResponseType<'ADD_HS'>>;
  removeHs: (
    params: ActionWorkerMessageNarrowerApplier<'REMOVE_HS'>['payload'],
  ) => Promise<PayloadResponseType<'REMOVE_HS'>>;
  getNewCoords: (
    params: ActionWorkerMessageNarrowerApplier<'GET_NEW_COORDS'>['payload'],
  ) => Promise<PayloadResponseType<'GET_NEW_COORDS'>>;
  getStereoTags: (
    params: ActionWorkerMessageNarrowerApplier<'GET_STEREO_TAGS'>['payload'],
  ) => Promise<PayloadResponseType<'GET_STEREO_TAGS'>>;
};

type RDKitUtilsNotReady = {
  isReady: false;
};

export type RDKitUtilsResult = RDKitUtilsReady | RDKitUtilsNotReady;

export const useRDKitUtils = (): RDKitUtilsResult => {
  const { worker } = useRDKit();

  if (!worker) {
    return { isReady: false };
  }

  // typeScript narrowing in closures
  const readyWorker = worker;

  function getMoleculeDetails(params: {
    smiles: string;
    returnFullDetails: true;
  }): Promise<PayloadResponseType<'GET_MOLECULE_DETAILS'>>;
  function getMoleculeDetails(params: {
    smiles: string;
    returnFullDetails?: false | undefined;
  }): Promise<PayloadResponseType<'DEPRECATED_GET_MOLECULE_DETAILS'>>;

  function getMoleculeDetails({ smiles, returnFullDetails = false }: { smiles: string; returnFullDetails?: boolean }) {
    // returnFullDetails = false is deprecated, returnFullDetails will be removed in v3 and returnFullDetails = true will be the default behavior
    return returnFullDetails
      ? getMoleculeDetailsAction(readyWorker, { smiles, returnFullDetails: true })
      : getMoleculeDetailsAction(readyWorker, { smiles, returnFullDetails: false });
  }

  return {
    isReady: true,
    isValidSmiles: (params) => isValidSmiles(readyWorker, params),
    isValidSmarts: (params) => isValidSmarts(readyWorker, params),
    isChiral: (params) => isChiral(readyWorker, params),
    getMorganFp: (params) => getMorganFp(readyWorker, params),
    hasMatchingSubstructure: (params) => hasMatchingSubstructure(readyWorker, params),
    getMoleculeDetails,
    getSvg: (params) => getSvg(readyWorker, params),
    isValidMolblock: (params) => isValidMolBlock(readyWorker, params),
    convertMolNotation: (params) => convertMolNotation(readyWorker, params),
    addHs: (params) => addHs(readyWorker, params),
    removeHs: (params) => removeHs(readyWorker, params),
    getNewCoords: (params) => getNewCoords(readyWorker, params),
    getStereoTags: (params) => getStereoTags(readyWorker, params),
  };
};
