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
import { get_molecules, get_query_molecules, release_molecules } from './molecule';

import { CIPAtoms, CIPBonds } from '../types';

export const getSvg = ({
  smiles,
  drawingDetails,
  alignmentDetails,
}: {
  smiles: string;
  drawingDetails?: DrawingDetails;
  alignmentDetails?: AlignmentDetails;
}) => {
  const molecules = alignmentDetails
    ? get_molecules([smiles, alignmentDetails.molBlock], globalThis.workerRDKit)
    : get_molecules([smiles], globalThis.workerRDKit);

  const [mol] = molecules;
  if (!mol) return null;

  if (alignmentDetails) {
    const [_, molToAlignWith] = molecules;
    if (!molToAlignWith) return null;

    mol.generate_aligned_coords(
      molToAlignWith,
      JSON.stringify({ useCoordGen: globalThis.rdkitWorkerGlobals.preferCoordgen }),
    );
  }

  const drawingDetailsStringifyed = drawingDetails ? JSON.stringify(drawingDetails) : '';
  const svg = mol.get_svg_with_highlights(drawingDetailsStringifyed);

  if (alignmentDetails) {
    // reset coords if alignment was used (mol could be in cache)
    mol.set_new_coords();
  }

  release_molecules(molecules);
  return svg;
};
export const getSvgFromSmarts = ({ smarts, width, height }: { smarts: string; width: number; height: number }) => {
  const [smartsMol] = get_query_molecules([smarts], globalThis.workerRDKit);
  if (!smartsMol) return null;

  const svg = smartsMol.get_svg(width, height);
  release_molecules([smartsMol]);
  return svg;
};

export type DeprecatedMoleculeBasicDetails = {
  numAtoms: number;
  numRings: number;
};

type MoleculeFullDetails = Descriptors;

export function getMoleculeDetails(params: { smiles: string; returnFullDetails: true }): MoleculeFullDetails | null;
export function getMoleculeDetails(params: {
  smiles: string;
  returnFullDetails: false;
}): DeprecatedMoleculeBasicDetails | null;
export function getMoleculeDetails({ smiles, returnFullDetails }: { smiles: string; returnFullDetails: boolean }) {
  const [mol] = get_molecules([smiles], globalThis.workerRDKit);
  if (!mol) return null;
  const details = JSON.parse(mol.get_descriptors());
  release_molecules([mol]);

  if (returnFullDetails) {
    return details as MoleculeFullDetails;
  }
  // Return basic details (numAtoms, numRings) will be deprecated in ^v3.0.0
  return {
    numAtoms: details.NumHeavyAtoms,
    numRings: details.NumRings,
  } as DeprecatedMoleculeBasicDetails;
}

export const getCanonicalFormForStructure = ({
  structure,
  useQMol = false,
}: {
  structure: string;
  molNotation?: MolNotation;
  useQMol?: boolean;
}): string | null => {
  return convertMolNotation({
    moleculeString: structure,
    targetNotation: useQMol ? 'smarts' : 'smiles',
    useQMol,
    sourceNotation: undefined,
  });
};

export const isChiral = (smiles: string): boolean => {
  const [mol] = get_molecules([smiles], globalThis.workerRDKit);
  if (!mol) {
    throw new Error('@iktos-oss/rdkit-provider: Failed to instanciate molecule');
  }

  try {
    // @ts-ignore
    const achiralSmiles = mol.get_smiles(JSON.stringify({ doIsomericSmiles: false }));
    // @ts-ignore
    const chiralSmiles = mol.get_smiles(JSON.stringify({ doIsomericSmiles: true }));
    return achiralSmiles !== chiralSmiles;
  } finally {
    release_molecules([mol]);
  }
};

export const getMorganFp = ({
  smiles,
  options,
}: {
  smiles: string;
  options?: { radius?: number; nBits?: number; len?: number };
}): string => {
  const [mol] = get_molecules([smiles], globalThis.workerRDKit);
  if (!mol) {
    throw new Error('@iktos-oss/rdkit-provider: Failed to instanciate molecule');
  }

  try {
    if (options) {
      return mol.get_morgan_fp(JSON.stringify(options));
    }
    return mol.get_morgan_fp();
  } finally {
    release_molecules([mol]);
  }
};

export const isValidSmiles = (smiles: string): boolean => {
  if (!smiles) return false;
  const [mol] = get_molecules([smiles], globalThis.workerRDKit);
  if (!mol) return false;
  const isValid = mol.is_valid();
  release_molecules([mol]);
  return isValid;
};

export const isValidSmarts = (smarts: string): boolean => {
  if (!smarts) return false;
  const [mol] = get_query_molecules([smarts], globalThis.workerRDKit);
  if (!mol) return false;

  const isValid = mol.is_valid();
  release_molecules([mol]);
  return isValid;
};

export const hasMatchingSubstructure = ({ smiles, substructure }: { smiles: string; substructure: string }) => {
  const [smilesMol] = get_molecules([smiles], globalThis.workerRDKit);
  const [smartsMol] = get_query_molecules([substructure], globalThis.workerRDKit);
  if (!smilesMol || !smartsMol) return false;
  const substructureMatchDetails = JSON.parse(smilesMol.get_substruct_match(smartsMol));
  const matchDetailsNotEmpty = !!substructureMatchDetails && !!Object.keys(substructureMatchDetails).length;

  release_molecules([smilesMol, smartsMol]);
  return matchDetailsNotEmpty;
};

export const getMatchingSubstructure = ({ structure, substructure }: { structure: string; substructure: string }) => {
  const [mol] = get_molecules([structure], globalThis.workerRDKit);
  const [molToMach] = get_query_molecules([substructure], globalThis.workerRDKit);
  if (!mol || !molToMach) return null;
  const { atoms, bonds } = JSON.parse(mol.get_substruct_match(molToMach)) as { atoms: number[]; bonds: number[] };
  release_molecules([mol, molToMach]);

  return { matchingAtoms: atoms, matchingBonds: bonds };
};

export const isValidMolBlock = (mdl: string) => {
  if (!mdl.includes('M  END')) return false;
  const [mol] = get_molecules([mdl], globalThis.workerRDKit);
  if (!mol) return false;
  try {
    return mol.is_valid();
  } finally {
    release_molecules([mol]);
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
  useQMol,
}: {
  moleculeString: string;
  targetNotation: MolNotation;
  sourceNotation?: SourceMolNotation;
  useQMol?: boolean;
}): string | null => {
  const shouldUseSmarts = !!useQMol || (useQMol === undefined && sourceNotation === 'smarts');

  if (sourceNotation != null) {
    if (sourceNotation === targetNotation)
      throw new Error('@iktos-oss/rdkit-provider: source and target notations must differ');
    if (!_validateSource(moleculeString, sourceNotation))
      throw new Error('@iktos-oss/rdkit-provider: molecule string not valid');
  }
  const [mol] = shouldUseSmarts
    ? get_query_molecules([moleculeString], globalThis.workerRDKit)
    : get_molecules([moleculeString], globalThis.workerRDKit);
  if (!mol) return null;
  try {
    return mol[`get_${targetNotation}`]();
  } catch (e) {
    console.error(e);
    throw new Error('@iktos-oss/rdkit-provider: target notation not implemented');
  } finally {
    release_molecules([mol]);
  }
};

export const getNewCoords = (structure: string, useCoordGen?: boolean) => {
  const [mol] = get_molecules([structure], globalThis.workerRDKit);
  if (!mol) return null;
  try {
    const mdl = useCoordGen !== undefined ? mol.get_new_coords(useCoordGen) : mol.get_new_coords();
    return mdl;
  } finally {
    release_molecules([mol]);
  }
};

export const removeHs = (structure: string) => {
  const [mol] = get_molecules([structure], globalThis.workerRDKit);
  if (!mol) return null;
  try {
    const mdl = mol.remove_hs();
    return getNewCoords(mdl, false);
  } finally {
    release_molecules([mol]);
  }
};

export const addHs = (structure: string) => {
  const [mol] = get_molecules([structure], globalThis.workerRDKit);
  if (!mol) return null;

  try {
    let mdl: string | null = mol.add_hs();
    mdl = getNewCoords(mdl, false);

    return mdl;
  } finally {
    release_molecules([mol]);
  }
};

export const getStereoTags = (structure: string) => {
  const [mol] = get_molecules([structure], globalThis.workerRDKit);
  if (!mol) throw new Error('@iktos-oss/rdkit-provider: mol is null');

  try {
    const stereoTags = mol.get_stereo_tags();
    const { CIP_atoms, CIP_bonds }: { CIP_atoms: CIPAtoms; CIP_bonds: CIPBonds } = JSON.parse(stereoTags);

    return {
      CIP_atoms,
      CIP_bonds,
    };
  } catch (e) {
    console.error(e);
    throw new Error('@iktos-oss/rdkit-provider: could not get stereo tags');
  } finally {
    release_molecules([mol]);
  }
};

const _validateSource = (structure: string, sourceNotation: SourceMolNotation) => {
  switch (sourceNotation) {
    case 'molblock':
      return isValidMolBlock(structure);
    case 'smiles':
      return isValidSmiles(structure);
    case 'smarts':
      return isValidSmarts(structure);
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
