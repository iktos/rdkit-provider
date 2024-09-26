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

import { useCallback } from 'react';
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

export const useRDKitUtils = () => {
  const { worker } = useRDKit();

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
    if (!worker) return rejectForWorkerNotInitted();

    // Handle different logic based on returnFullDetails flag
    return returnFullDetails
      ? getMoleculeDetailsAction(worker, { smiles, returnFullDetails: true })
      : getMoleculeDetailsAction(worker, { smiles, returnFullDetails: false });
  }
  return {
    isValidSmiles: useCallback(
      async (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMILES'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isValidSmiles(worker, params);
      },
      [worker],
    ),
    isValidSmarts: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMARTS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isValidSmarts(worker, params);
      },
      [worker],
    ),
    isChiral: useCallback(
      async (params: ActionWorkerMessageNarrowerApplier<'IS_CHIRAL'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isChiral(worker, params);
      },
      [worker],
    ),
    getMorganFp: useCallback(
      async (params: ActionWorkerMessageNarrowerApplier<'GET_MORGAN_FP'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getMorganFp(worker, params);
      },
      [worker],
    ),
    hasMatchingSubstructure: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'HAS_MATCHING_SUBSTRUCTURE'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return hasMatchingSubstructure(worker, params);
      },
      [worker],
    ),
    // igonring getMoleculeDetails as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getMoleculeDetails: useCallback(getMoleculeDetails, [worker]),
    getSvg: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_SVG'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getSvg(worker, params);
      },
      [worker],
    ),
    isValidMolblock: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_MOLBLOCK'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isValidMolBlock(worker, params);
      },
      [worker],
    ),
    convertMolNotation: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'CONVERT_MOL_NOTATION'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return convertMolNotation(worker, params);
      },
      [worker],
    ),
    addHs: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'ADD_HS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return addHs(worker, params);
      },
      [worker],
    ),
    removeHs: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'REMOVE_HS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return removeHs(worker, params);
      },
      [worker],
    ),
    getNewCoords: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_NEW_COORDS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getNewCoords(worker, params);
      },
      [worker],
    ),
    getStereoTags: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_STEREO_TAGS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getStereoTags(worker, params);
      },
      [worker],
    ),
  };
};

const rejectForWorkerNotInitted = () => Promise.reject('[@iktos-oss/rdkit-provider] rdkit worker not inited');
