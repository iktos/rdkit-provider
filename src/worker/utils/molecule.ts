import { get_molecule, release_molecule } from '../../utils';

export const getSvg = (smiles: string, drawingDetails: string) => {
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return null;
  const svg = mol.get_svg_with_highlights(drawingDetails);
  release_molecule(mol);
  return svg;
};
