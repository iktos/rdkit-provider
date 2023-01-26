import { useCallback } from 'react';
import { GetMoleculeDetailsParams, get_molecule_details } from '../utils/molecule';
import {
  HasMatchingSubstructureParams,
  has_matching_substructure,
  IsValidSmartsParams,
  IsValidSmilesParams,
  is_valid_smarts,
  is_valid_smiles,
} from '../utils/validations';
import { useRDKit } from './useRDKit';

export const useRDKitUtils = () => {
  const { RDKit } = useRDKit();

  return {
    isValidSmiles: useCallback((params: IsValidSmilesParams) => is_valid_smiles(params, RDKit), [RDKit]),
    isValidSmarts: useCallback((params: IsValidSmartsParams) => is_valid_smarts(params, RDKit), [RDKit]),
    hasMatchingSubstructure: useCallback(
      (params: HasMatchingSubstructureParams) => has_matching_substructure(params, RDKit),
      [RDKit],
    ),
    getMoleculeDetails: useCallback((params: GetMoleculeDetailsParams) => get_molecule_details(params, RDKit), [RDKit]),
  };
};
