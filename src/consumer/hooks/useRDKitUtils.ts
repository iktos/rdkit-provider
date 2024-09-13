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

import { useCallback, useRef } from 'react';
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
} from '../actions';
import { ActionWorkerMessageNarrowerApplier } from '../../worker/actions';

import { useRDKit } from '../../hooks/useRDKit';
import { PayloadResponseType } from '../../worker/worker';

export const useRDKitUtils = () => {
  const { workers } = useRDKit();
  const currentWorkerIndex = useRef(0);

  const getNextWorker = useCallback(() => {
    currentWorkerIndex.current = (currentWorkerIndex.current + 1) % workers.length;
    return workers[currentWorkerIndex.current];
  }, [workers]);

  const rejectForNoWorkers = () => Promise.reject('[@iktos-oss/rdkit-provider] no rdkit workers available');

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
    if (workers.length === 0) return rejectForWorkerNotInitted();

    // Handle different logic based on returnFullDetails flag
    return returnFullDetails
      ? getMoleculeDetailsAction(getNextWorker(), { smiles, returnFullDetails: true })
      : getMoleculeDetailsAction(getNextWorker(), { smiles, returnFullDetails: false });
  }

  return {
    isValidSmiles: useCallback(
      async (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMILES'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return isValidSmiles(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    isValidSmarts: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_SMARTS'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return isValidSmarts(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    hasMatchingSubstructure: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'HAS_MATCHING_SUBSTRUCTURE'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return hasMatchingSubstructure(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    // igonring getMoleculeDetails as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getMoleculeDetails: useCallback(getMoleculeDetails, [workers, getNextWorker]),
    getSvg: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_SVG'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return getSvg(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    isValidMolblock: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'IS_VALID_MOLBLOCK'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return isValidMolBlock(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    convertMolNotation: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'CONVERT_MOL_NOTATION'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return convertMolNotation(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    addHs: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'ADD_HS'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return addHs(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    removeHs: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'REMOVE_HS'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return removeHs(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    getNewCoords: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_NEW_COORDS'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return getNewCoords(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
    getStereoTags: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_STEREO_TAGS'>['payload']) => {
        if (workers.length === 0) return rejectForNoWorkers();
        return getStereoTags(getNextWorker(), params);
      },
      [workers, getNextWorker],
    ),
  };
};

const rejectForWorkerNotInitted = () => Promise.reject('[@iktos-oss/rdkit-provider] rdkit worker not inited');
