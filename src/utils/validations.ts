import { RDKitModule } from '@rdkit/rdkit';
import { isEmpty } from 'lodash';
import { get_molecule } from './molecule';

export const is_valid_smiles = ({ smiles }: IsValidSmilesParams, RDKit: RDKitModule | null) => {
  if (!RDKit) return null;
  if (!smiles) return false;
  const mol = RDKit.get_mol(smiles);
  const isValid = mol.is_valid();
  mol.delete();
  return isValid;
};

export const is_valid_smarts = ({ smarts }: IsValidSmartsParams, RDKit: RDKitModule | null) => {
  if (!RDKit) return null;
  if (!smarts) return false;
  const mol = RDKit.get_qmol(smarts);
  const isValid = mol.is_valid();
  mol.delete();
  return isValid;
};

export const has_matching_substructure = (
  { smiles, substructure }: HasMatchingSubstructureParams,
  RDKit: RDKitModule | null,
) => {
  if (!RDKit) return null;
  const smilesMol = get_molecule(smiles, RDKit);
  const smartsMol = RDKit.get_qmol(substructure);
  if (!smilesMol) return null;
  const substructureMatchDetails = JSON.parse(smilesMol.get_substruct_match(smartsMol));
  const smilesDetails = JSON.parse(smilesMol.get_json());

  return (
    !isEmpty(substructureMatchDetails) &&
    smilesDetails.molecules &&
    smilesDetails.molecules?.length === 1 &&
    substructureMatchDetails.atoms?.length === smilesDetails.molecules[0]?.atoms?.length
  );
};

export interface IsValidSmilesParams {
  smiles: string;
}

export interface IsValidSmartsParams {
  smarts: string;
}

export interface HasMatchingSubstructureParams {
  smiles: string;
  substructure: string;
}
