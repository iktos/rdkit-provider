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
import { getMoleculeDetails, hasMatchingSubstructure, isValidSmarts, isValidSmiles } from '..';
import { ActionWorkerMessageNarrowerApplier } from '../../worker/actions';

import { useRDKit } from '../../hooks/useRDKit';

export const useRDKitUtils = () => {
  const { worker } = useRDKit();

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
    hasMatchingSubstructure: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'HAS_MATCHING_SUBSTRUCTURE'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return hasMatchingSubstructure(worker, params);
      },
      [worker],
    ),
    getMoleculeDetails: useCallback(
      (params: ActionWorkerMessageNarrowerApplier<'GET_MOLECULE_DETAILS'>['payload']) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getMoleculeDetails(worker, params);
      },
      [worker],
    ),
  };
};

const rejectForWorkerNotInitted = () => Promise.reject('[@iktos-oss/rdkit-provider] rdkit worker not inited');
