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

import { JSMol } from '@rdkit/rdkit';

type MolType = 'mol' | 'qmol';

const storeMolInCacheBasedOnMolType = (structure: string, jsMol: JSMol, molType: MolType) => {
  if (
    !globalThis.rdkitWorkerGlobals.jsMolCacheEnabled ||
    !globalThis.rdkitWorkerGlobals.jsMolCache ||
    !globalThis.rdkitWorkerGlobals.jsQMolCache
  )
    return;
  if (molType === 'mol') {
    globalThis.rdkitWorkerGlobals.jsMolCache[structure] = jsMol;
  }
  if (molType === 'qmol') {
    globalThis.rdkitWorkerGlobals.jsQMolCache[structure] = jsMol;
  }
};

export const storeJSMolsInCache = (molsToStore: { structure: string; jsMol: JSMol | null; molType: MolType }[]) => {
  if (
    !globalThis.rdkitWorkerGlobals.jsMolCacheEnabled ||
    (!globalThis.rdkitWorkerGlobals.jsMolCache && !globalThis.rdkitWorkerGlobals.jsQMolCache)
  ) {
    return;
  }

  const nbCachedMolecules = globalThis.rdkitWorkerGlobals.jsMolCache
    ? Object.keys(globalThis.rdkitWorkerGlobals.jsMolCache).length
    : 0;
  const nbCachedQMolecules = globalThis.rdkitWorkerGlobals.jsQMolCache
    ? Object.keys(globalThis.rdkitWorkerGlobals.jsQMolCache).length
    : 0;

  const validMolsToStore = molsToStore.filter((mol) => mol.jsMol !== null);
  const molsToAdd = validMolsToStore.filter((mol) => mol.molType === 'mol').length;
  const qmolsToAdd = validMolsToStore.filter((mol) => mol.molType === 'qmol').length;

  const maxJsMolsCached = globalThis.rdkitWorkerGlobals.maxJsMolsCached;
  const willExceedMols = nbCachedMolecules + molsToAdd > maxJsMolsCached;
  const willExceedQMols = nbCachedQMolecules + qmolsToAdd > maxJsMolsCached;

  if (willExceedMols) {
    cleanMolsCache();
  }
  if (willExceedQMols) {
    cleanQMolsCache();
  }

  for (const { structure, jsMol, molType } of validMolsToStore) {
    try {
      storeMolInCacheBasedOnMolType(structure, jsMol as JSMol, molType); // Type assertion since we filtered nulls
    } catch (e) {
      console.error(e);
      if (molType === 'mol') {
        cleanMolsCache();
      } else {
        cleanQMolsCache();
      }
      storeMolInCacheBasedOnMolType(structure, jsMol as JSMol, molType);
    }
  }
};

const getJSMolFromCache = (structure: string, molType: MolType) => {
  if (
    !globalThis.rdkitWorkerGlobals.jsMolCacheEnabled ||
    (!globalThis.rdkitWorkerGlobals.jsMolCache && !globalThis.rdkitWorkerGlobals.jsQMolCache)
  ) {
    return null;
  }

  if (molType === 'mol') {
    if (!globalThis.rdkitWorkerGlobals.jsMolCache) {
      return null;
    }
    return globalThis.rdkitWorkerGlobals.jsMolCache[structure];
  }
  if (molType === 'qmol') {
    if (!globalThis.rdkitWorkerGlobals.jsQMolCache) {
      return null;
    }
    return globalThis.rdkitWorkerGlobals.jsQMolCache[structure];
  }

  throw new Error(`@iktos-oss/rdkit-provider unkown molType=${molType} passed to getJSMolFromCache`);
};

export const getJSMolsFromCache = (structures: string[], molType: MolType) => {
  return structures.map((struct) => getJSMolFromCache(struct, molType));
};

const cleanMolsCache = () => {
  if (globalThis.rdkitWorkerGlobals?.jsMolCache) {
    for (const [structure, mol] of Object.entries(globalThis.rdkitWorkerGlobals.jsMolCache)) {
      try {
        mol.delete();
        delete globalThis.rdkitWorkerGlobals.jsMolCache[structure];
      } catch {
        // multiple cleanMolCache could be called in the same time, => avoid calling delete on the same mol
      }
    }
  }
};

const cleanQMolsCache = () => {
  if (globalThis.rdkitWorkerGlobals?.jsQMolCache) {
    for (const [structure, mol] of Object.entries(globalThis.rdkitWorkerGlobals.jsQMolCache)) {
      try {
        mol.delete();
        delete globalThis.rdkitWorkerGlobals.jsQMolCache[structure];
      } catch {
        // multiple cleanMolCache could be called in the same time, => avoid calling delete on the same mol
      }
    }
  }
};

export const cleanMolCache = () => {
  cleanMolsCache();
  cleanQMolsCache();
};

export const cleanAllCache = () => {
  cleanMolCache();
};
