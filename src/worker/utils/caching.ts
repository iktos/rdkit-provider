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

import { JSMol } from '@rdkit/rdkit';

export const storeJSMolInCache = (smiles: string, mol: JSMol) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) return;
  const nbCachedMolecules = Object.keys(globalThis.rdkitWorkerGlobals.jsMolCache).length;
  if (nbCachedMolecules > globalThis.rdkitWorkerGlobals.maxJsMolsCached) {
    cleanJSMolCache();
  }
  try {
    globalThis.rdkitWorkerGlobals.jsMolCache.set(smiles, mol);
  } catch (e) {
    console.error(e);
    cleanJSMolCache();
    globalThis.rdkitWorkerGlobals.jsMolCache.set(smiles, mol);
  }
};

export const getJSMolFromCache = (smiles: string) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) {
    return null;
  }
  return globalThis.rdkitWorkerGlobals.jsMolCache.get(smiles);
};

export const cleanJSMolCache = () => {
  if (!globalThis.rdkitWorkerGlobals?.jsMolCache) return;
  for (const [smiles, mol] of globalThis.rdkitWorkerGlobals.jsMolCache.entries()) {
    try {
      mol.delete();
      globalThis.rdkitWorkerGlobals.jsMolCache.delete(smiles);
    } catch {
      // multiple cleanJSMolCache could be called in the same time, => avoid calling delete on the same mol
    }
  }
};

export const cleanAllCache = () => {
  cleanJSMolCache();
};
