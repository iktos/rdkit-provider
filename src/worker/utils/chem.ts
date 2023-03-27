﻿/* 
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

import { get_molecule, release_molecule } from './molecule';

export const getSvg = ({
  smiles,
  drawingDetails,
  alignmentDetails,
}: {
  smiles: string;
  drawingDetails: string;
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
  const svg = mol.get_svg_with_highlights(drawingDetails);
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

export const getMatchingSubstructure = ({ structure, substructure }: { structure: string; substructure: string }) => {
  const mol = get_molecule(structure, globalThis.workerRDKit);
  const molToMach = get_molecule(substructure, globalThis.workerRDKit);
  if (!mol || !molToMach) return null;
  const { atoms, bonds } = JSON.parse(mol.get_substruct_match(molToMach)) as { atoms: number[]; bonds: number[] };
  release_molecule(mol);
  release_molecule(molToMach);

  return { matchingAtoms: atoms, matchingBonds: bonds };
};

export interface AlignmentDetails {
  molBlock: string;
  highlightColor?: RDKitColor;
}
type RDKitColor = number[];
