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

export const isValidSmarts = (smarts: string): boolean => {
  if (!smarts) return false;
  const mol = globalThis.workerRDKit.get_qmol(smarts);
  const isValid = mol.is_valid();
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled) {
    mol.delete();
  }
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

export const hasMatchingSubstructure = ({ smiles, substructure }: { smiles: string; substructure: string }) => {
  const smilesMol = get_molecule(smiles, globalThis.workerRDKit);
  const smartsMol = globalThis.workerRDKit.get_qmol(substructure);
  if (!smilesMol) return false;
  const substructureMatchDetails = JSON.parse(smilesMol.get_substruct_match(smartsMol));
  const smilesDetails = JSON.parse(smilesMol.get_json());
  const matchDetailsNotEmpty = !!substructureMatchDetails && !!Object.keys(substructureMatchDetails).length;

  return (
    matchDetailsNotEmpty &&
    !!smilesDetails.molecules &&
    smilesDetails.molecules?.length === 1 &&
    substructureMatchDetails.atoms?.length === smilesDetails.molecules[0]?.atoms?.length
  );
};
