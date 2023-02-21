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
