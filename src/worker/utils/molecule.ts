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
import { cleanMolCache, clearCacheIfWillOverflow, getJSMolsFromCache, storeJSMolsInCache } from './caching';

const createMol = (smiles: string, RDKit: RDKitModule) => {
  const molInstantiationDetails = { removeHs: globalThis.rdkitWorkerGlobals.removeHs };
  const mol = RDKit.get_mol(smiles, JSON.stringify(molInstantiationDetails));
  if (!mol) {
    console.error('@iktos-oss/rdkit-provider: failed to get mol for smiles = ', smiles);
    return null;
  }
  return mol;
};

const createQMol = (smarts: string, RDKit: RDKitModule) => {
  const qmol = RDKit.get_qmol(smarts);
  if (!qmol) {
    console.error('@iktos-oss/rdkit-provider: failed to get qmol for structure =', smarts);
    return null;
  }
  return qmol;
};

const get_molecules_memory_unsafe = (listOfSmiles: string[], RDKit: RDKitModule) => {
  if (!RDKit) return [];
  clearCacheIfWillOverflow({ nbMols: listOfSmiles.length, nbQmols: 0 });
  const cachedMolecules = getJSMolsFromCache(listOfSmiles, 'mol');
  const mols = cachedMolecules.map((cachedMol, idx) => {
    if (cachedMol) {
      return cachedMol;
    }

    return createMol(listOfSmiles[idx], RDKit);
  });
  storeJSMolsInCache(
    mols.map((jsMol, idx) => ({
      structure: listOfSmiles[idx],
      jsMol,
      molType: 'mol',
    })),
  );

  return mols;
};

export const get_molecules = (listOfSmiles: string[], RDKit: RDKitModule) => {
  try {
    return get_molecules_memory_unsafe(listOfSmiles, RDKit);
  } catch (e) {
    // clean cache on possible Runtimeerror OOM
    console.error('@iktos-oss/rdkit-provider: caught error during get_molecules', e);
    console.info('@iktos-oss/rdkit-provider: clearing cache');
    cleanMolCache();
    return get_molecules_memory_unsafe(listOfSmiles, RDKit);
  }
};

const get_query_molecules_memory_unsafe = (listOfSmarts: string[], RDKit: RDKitModule) => {
  if (!RDKit) return [];
  clearCacheIfWillOverflow({ nbMols: 0, nbQmols: listOfSmarts.length });
  const cachedQMolecules = getJSMolsFromCache(listOfSmarts, 'qmol');
  const qmols = cachedQMolecules.map((cachedQMol, idx) => {
    if (cachedQMol) {
      return cachedQMol;
    }

    return createQMol(listOfSmarts[idx], RDKit);
  });

  storeJSMolsInCache(
    qmols.map((jsMol, idx) => ({
      structure: listOfSmarts[idx],
      jsMol,
      molType: 'qmol',
    })),
  );
  return qmols;
};

export const get_query_molecules = (listOfSmarts: string[], RDKit: RDKitModule) => {
  try {
    return get_query_molecules_memory_unsafe(listOfSmarts, RDKit);
  } catch (e) {
    console.error(e);
    cleanMolCache();
    return get_query_molecules_memory_unsafe(listOfSmarts, RDKit);
  }
};

export const release_molecules = (mols: Array<JSMol | null>) => {
  // to be called after every jsMol instanciation via get_molecule call
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled) {
    for (const mol of mols) {
      mol?.delete();
    }
  }
};
