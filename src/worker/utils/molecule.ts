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

import { JSMol, RDKitModule } from '@rdkit/rdkit';
import { cleanMolCache, getJSMolFromCache, storeJSMolInCache } from './caching';

const get_molecule_memory_unsafe = (smiles: string, RDKit: RDKitModule) => {
  const cachedMolecule = getJSMolFromCache(smiles, 'mol');
  if (cachedMolecule) return cachedMolecule;
  if (!smiles) return null;
  if (!RDKit) return null;

  const molInstantiationDetails = { removeHs: globalThis.rdkitWorkerGlobals.removeHs };
  const mol = RDKit.get_mol(smiles, JSON.stringify(molInstantiationDetails));
  if (!mol) {
    console.error('@iktos-oss/rdkit-provider: failed to get mol for smiles = ', smiles);
    return null;
  }

  storeJSMolInCache(smiles, mol, 'mol');
  return mol;
};

export const get_molecule = (smiles: string, RDKit: RDKitModule) => {
  try {
    return get_molecule_memory_unsafe(smiles, RDKit);
  } catch (e) {
    // clean cache on possible Runtimeerror OOM
    console.error(e);
    cleanMolCache();
    return get_molecule_memory_unsafe(smiles, RDKit);
  }
};

const get_query_molecule_memory_unsafe = (structure: string, RDKit: RDKitModule) => {
  const cachedQMolecule = getJSMolFromCache(structure, 'qmol');
  if (cachedQMolecule) return cachedQMolecule;
  if (!structure) return null;
  if (!RDKit) return null;

  const qmol = RDKit.get_qmol(structure);
  if (!qmol) {
    console.error('@iktos-oss/rdkit-provider: failed to get qmol for structure =', structure);
    return null;
  }

  storeJSMolInCache(structure, qmol, 'qmol');
  return qmol;
};

export const get_query_molecule = (structure: string, RDKit: RDKitModule) => {
  try {
    return get_query_molecule_memory_unsafe(structure, RDKit);
  } catch (e) {
    console.error(e);
    cleanMolCache();
    return get_query_molecule_memory_unsafe(structure, RDKit);
  }
};

export const release_molecule = (mol: JSMol) => {
  // to be called after every jsMol instanciation via get_molecule call
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled && mol) {
    mol.delete();
  }
};
