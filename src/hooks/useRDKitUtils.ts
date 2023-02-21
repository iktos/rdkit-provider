import { useCallback } from 'react';
import { getMoleculeDetails, hasMatchingSubstructure, isValidSmarts, isValidSmiles } from '../consumer';
import {
  HasMatchingSubstructureParams,
  IsValidSmartsParams,
  IsValidSmilesParams,
  GetMoleculeDetailsParams,
} from '../types';

import { useRDKit } from './useRDKit';

export const useRDKitUtils = () => {
  const { worker } = useRDKit();

  return {
    isValidSmiles: useCallback(
      async (params: IsValidSmilesParams) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isValidSmiles(worker, params);
      },
      [worker],
    ),
    isValidSmarts: useCallback(
      (params: IsValidSmartsParams) => {
        if (!worker) return rejectForWorkerNotInitted();
        return isValidSmarts(worker, params);
      },
      [worker],
    ),
    hasMatchingSubstructure: useCallback(
      (params: HasMatchingSubstructureParams) => {
        if (!worker) return rejectForWorkerNotInitted();
        return hasMatchingSubstructure(worker, params);
      },
      [worker],
    ),
    getMoleculeDetails: useCallback(
      (params: GetMoleculeDetailsParams) => {
        if (!worker) return rejectForWorkerNotInitted();
        return getMoleculeDetails(worker, params);
      },
      [worker],
    ),
  };
};

const rejectForWorkerNotInitted = () => Promise.reject('[@iktos-oss/rdkit-provider] rdkit worker not inited');
