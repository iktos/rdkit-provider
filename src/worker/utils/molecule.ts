import { get_molecule, release_molecule } from '../../utils';

export const getSvg = (smiles: string, drawingDetails: string) => {
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return null;
  const svg = mol.get_svg_with_highlights(drawingDetails);
  release_molecule(mol);
  return svg;
};

export const getMoleculeDetails = (smiles: string) => {
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return null;
  const details = JSON.parse(mol.get_descriptors());
  release_molecule(mol);
  return {
    numAtoms: details.NumHeavyAtoms,
    numRings: details.NumRings,
  };
};

export const getCanonicalFormForStructure = (structure: string): string | null => {
  if (isValidSmiles(structure)) return getCanonicalSmiles(structure);
  return getCanonicalSmarts(structure);
};

export const isValidSmiles = (smiles: string): boolean => {
  if (!smiles) return false;
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return false;
  const isValid = mol.is_valid();
  release_molecule(mol);
  return isValid;
};

const getCanonicalSmiles = (smiles: string): string | null => {
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return null;
  const cannonicalSmiles = mol.get_smiles();
  release_molecule(mol);
  return cannonicalSmiles;
};
const getCanonicalSmarts = (smarts: string): string | null => {
  const mol = get_molecule(smarts, globalThis.workerRDKit);
  if (!mol) return null;
  const canoncialSmarts = mol.get_smarts();
  release_molecule(mol);
  return canoncialSmarts;
};
