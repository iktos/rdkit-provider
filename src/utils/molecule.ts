import { RDKitModule } from '@rdkit/rdkit';

export const get_molecule = (smiles: string, RDKit: RDKitModule | null) => {
  if (!RDKit) return null;
  // we need to manually call delete on the created molecule instance once done using it,
  // to avoid memory leakage 1576-resolve-oom-error-when-redkit-is-spammed-in-a-short-amount-of-time
  const tempMolecule = RDKit.get_mol(smiles);
  // get_new_coords(true) -> better macrocyles drawing.
  const mdlWithCoords = tempMolecule.get_new_coords(true);
  tempMolecule.delete();

  return RDKit.get_mol(mdlWithCoords);
};

export const get_molecule_details = ({ smiles }: GetMoleculeDetailsParams, RDKit: RDKitModule | null) => {
  if (!RDKit) return null;
  const mol = get_molecule(smiles, RDKit);
  if (!mol) return null;
  const details = JSON.parse(mol.get_descriptors());
  mol.delete();

  return {
    numAtoms: details.NumHeavyAtoms,
    numRings: details.NumRings,
  };
};

export interface GetMoleculeDetailsParams {
  smiles: string;
}
