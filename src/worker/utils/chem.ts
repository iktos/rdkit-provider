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

import { RDKitColor } from '../../types';
import { get_molecule, release_molecule } from './molecule';

export const getSvg = ({
  smiles,
  drawingDetails,
  alignmentDetails,
}: {
  smiles: string;
  drawingDetails?: DrawingDetails;
  alignmentDetails?: AlignmentDetails;
}) => {
  const mol = get_molecule(smiles, globalThis.workerRDKit);
  if (!mol) return null;
  if (alignmentDetails) {
    const molToAlignWith = get_molecule(alignmentDetails.molBlock, globalThis.workerRDKit);
    if (!molToAlignWith) return null;
    mol.generate_aligned_coords(molToAlignWith, true);
    release_molecule(molToAlignWith);
  }
  const drawingDetailsStringifyed = drawingDetails ? JSON.stringify(drawingDetails) : '';
  const svg = mol.get_svg_with_highlights(drawingDetailsStringifyed);
  if (alignmentDetails) {
    // reset coords as mol could be in cache
    mol.set_new_coords();
  }
  release_molecule(mol);
  return svg;
};

export const getSvgFromSmarts = ({ smarts, width, height }: { smarts: string; width: number; height: number }) => {
  const smartsMol = globalThis.workerRDKit.get_qmol(smarts);
  const svg = smartsMol.get_svg(width, height);
  smartsMol.delete();
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

export const getCanonicalFormForStructure = ({
  structure,
  molNotation = 'smiles',
  useQMol = false,
}: {
  structure: string;
  molNotation?: MolNotation;
  useQMol?: boolean;
}): string | null => {
  return convertMolNotation({
    moleculeString: structure,
    targetNotation: molNotation,
    sourceNotation: undefined,
    useQMol,
  });
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

// const getCanonicalSmiles = (smiles: string): string | null => {
//   const mol = get_molecule(smiles, globalThis.workerRDKit);
//   if (!mol) return null;
//   const cannonicalSmiles = mol.get_smiles();
//   release_molecule(mol);
//   return cannonicalSmiles;
// };
// const getCanonicalSmarts = (smarts: string): string | null => {
//   const qmol = get_query_molecule(smarts, globalThis.workerRDKit);
//   if (!qmol) return null;
//   const canonicalSmarts = qmol.get_smarts();
//   release_molecule(qmol);
//   return canonicalSmarts;
// };

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

export const getMatchingSubstructure = ({ structure, substructure }: { structure: string; substructure: string }) => {
  const mol = get_molecule(structure, globalThis.workerRDKit);
  const molToMach = get_molecule(substructure, globalThis.workerRDKit);
  if (!mol || !molToMach) return null;
  const { atoms, bonds } = JSON.parse(mol.get_substruct_match(molToMach)) as { atoms: number[]; bonds: number[] };
  release_molecule(mol);
  release_molecule(molToMach);

  return { matchingAtoms: atoms, matchingBonds: bonds };
};

export const isValidMolBlock = (mdl: string) => {
  if (!mdl.includes('M  END')) return false;
  const mol = get_molecule(mdl, globalThis.workerRDKit);
  if (!mol) return false;
  try {
    return mol.is_valid();
  } finally {
    release_molecule(mol);
  }
};

/**
 * Convert molecule structure to given notation (smiles, smarts, molblock, ...)
 * Warning: some notations like inchi and aromatic_form don't work with qmol
 */
export const convertMolNotation = ({
  moleculeString,
  targetNotation,
  sourceNotation,
  useQMol = false,
}: {
  moleculeString: string;
  targetNotation: MolNotation;
  sourceNotation?: SourceMolNotation;
  useQMol?: boolean;
}): string | null => {
  if (sourceNotation != null) {
    if (sourceNotation === targetNotation)
      throw new Error('@iktos-oss/rdkit-provider: source and target notations must differ');
    if (!_validateSource(moleculeString, sourceNotation))
      throw new Error('@iktos-oss/rdkit-provider: molecule string not valid');
  }
  const mol = useQMol
    ? globalThis.workerRDKit.get_qmol(moleculeString)
    : get_molecule(moleculeString, globalThis.workerRDKit);
  if (!mol) return null;
  try {
    return mol[`get_${targetNotation}`]();
  } catch (e) {
    console.error(e);
    throw new Error('@iktos-oss/rdkit-provider: target notation not implemented');
  } finally {
    useQMol ? mol?.delete() : release_molecule(mol);
  }
};

export const getNewCoords = (structure: string, useCoordGen?: boolean) => {
  const mol = get_molecule(structure, globalThis.workerRDKit);
  if (!mol) return null;
  try {
    const mdl = useCoordGen !== undefined ? mol.get_new_coords(useCoordGen) : mol.get_new_coords();
    return mdl;
  } finally {
    release_molecule(mol);
  }
};

export const removeHs = (structure: string) => {
  const mol = get_molecule(structure, globalThis.workerRDKit);
  if (!mol) return null;
  try {
    const mdl = mol.remove_hs();
    return getNewCoords(mdl, false);
  } finally {
    release_molecule(mol);
  }
};

export const addHs = (structure: string) => {
  const mol = get_molecule(structure, globalThis.workerRDKit);
  if (!mol) return null;

  try {
    let mdl: string | null = mol.add_hs();
    mdl = getNewCoords(mdl, false);

    return mdl;
  } finally {
    release_molecule(mol);
  }
};

const _validateSource = (structure: string, sourceNotation: SourceMolNotation) => {
  switch (sourceNotation) {
    case 'molblock':
      return isValidMolBlock(structure);
    case 'smiles':
      return isValidSmiles(structure);
    case 'smarts':
      return isValidSmiles(structure);
    default:
      throw new Error(`@iktos-oss/rdkit-provider: validate ${sourceNotation} not implemented`);
  }
};

export interface AlignmentDetails {
  molBlock: string;
  highlightColor?: RDKitColor;
}
export interface DrawingDetails {
  width: number;
  height: number;
  bondLineWidth?: number;
  backgroundColour?: RDKitColor;
  highlightColour?: RDKitColor;
  highlightRadius?: number;
  fixedBondLength?: number;
  addAtomIndices?: boolean;
  // highlight atoms indicies
  atoms?: number[];
  // highlight bonds indicies
  bonds?: number[];
  highlightAtomColors?: Record<number, RDKitColor>;
  highlightBondColors?: Record<number, RDKitColor>;
}

export type MolNotation =
  | 'aromatic_form'
  | 'cxsmiles'
  | 'inchi'
  | 'kekule_form'
  | 'molblock'
  | 'smarts'
  | 'smiles'
  | 'v3Kmolblock';

export type SourceMolNotation = 'smarts' | 'smiles' | 'molblock';

export type Descriptors = {
  amw: number;
  chi0n: number;
  chi0v: number;
  chi1n: number;
  chi1v: number;
  chi2n: number;
  chi2v: number;
  chi3n: number;
  chi3v: number;
  chi4n: number;
  chi4v: number;
  CrippenClogP: number;
  CrippenMR: number;
  exactmw: number;
  FractionCSP3: number;
  hallKierAlpha: number;
  kappa1: number;
  kappa2: number;
  kappa3: number;
  labuteASA: number;
  lipinskiHBA: number;
  lipinskiHBD: number;
  NumAliphaticHeterocycles: number;
  NumAliphaticRings: number;
  NumAmideBonds: number;
  NumAromaticHeterocycles: number;
  NumAromaticRings: number;
  NumAtoms: number;
  NumAtomStereoCenters: number;
  NumBridgeheadAtoms: number;
  NumHBA: number;
  NumHBD: number;
  NumHeavyAtoms: number;
  NumHeteroatoms: number;
  NumHeterocycles: number;
  NumRings: number;
  NumRotatableBonds: number;
  NumSaturatedHeterocycles: number;
  NumSaturatedRings: number;
  NumSpiroAtoms: number;
  NumUnspecifiedAtomStereoCenters: number;
  Phi: number;
  tpsa: number;
};

export type SubstructMatch = {
  atoms?: number[];
  bonds?: number[];
};
