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

import { JSMol, SubstructLibrary } from '@rdkit/rdkit';

/**
 * Store JSMol object in global jsMolCache
 * @param structure can be a smiles, smarts or molblock...
 * @param jsMol can be a mol or qmol
 */
export const storeJSMolInCache = (structure: string, jsMol: JSMol) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) return;
  const nbCachedMolecules = Object.keys(globalThis.rdkitWorkerGlobals.jsMolCache).length;
  if (nbCachedMolecules > globalThis.rdkitWorkerGlobals.maxJsMolsCached) {
    cleanJSMolCache();
    globalThis.rdkitWorkerGlobals.jsMolCache = { [structure]: jsMol };
    return;
  }
  try {
    globalThis.rdkitWorkerGlobals.jsMolCache[structure] = jsMol;
  } catch (e) {
    console.error(e);
    cleanJSMolCache();
    globalThis.rdkitWorkerGlobals.jsMolCache = { [structure]: jsMol };
  }
};

export const getJSMolFromCache = (structure: string) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) {
    return null;
  }
  return globalThis.rdkitWorkerGlobals.jsMolCache[structure];
};

export const cleanJSMolCache = () => {
  if (!globalThis.rdkitWorkerGlobals?.jsMolCache) return;
  for (const [structure, mol] of Object.entries(globalThis.rdkitWorkerGlobals.jsMolCache)) {
    try {
      mol.delete();
      delete globalThis.rdkitWorkerGlobals.jsMolCache[structure];
    } catch {
      // multiple cleanJSMolCache could be called in the same time, => avoid calling delete on the same mol
    }
  }
};

export const storeSubstructLibInCache = (name: string, substructLib: SubstructLibrary) => {
  if (!globalThis.rdkitWorkerGlobals.substructLibCacheEnabled || !globalThis.rdkitWorkerGlobals.substructLibCache)
    return;
  if (globalThis.rdkitWorkerGlobals.substructLibCache[name]) {
    // @ts-ignore
    globalThis.rdkitWorkerGlobals.substructLibCache[name].delete();
    delete globalThis.rdkitWorkerGlobals.substructLibCache[name];
  }

  globalThis.rdkitWorkerGlobals.substructLibCache[name] = substructLib;
};

export const getSubstructLibFromCache = (name: string) => {
  if (!globalThis.rdkitWorkerGlobals.substructLibCacheEnabled || !globalThis.rdkitWorkerGlobals.substructLibCache) {
    return null;
  }
  return globalThis.rdkitWorkerGlobals.substructLibCache[name];
};

export const removeSubstructLibFromCache = (name: string) => {
  if (!globalThis.rdkitWorkerGlobals.substructLibCacheEnabled || !globalThis.rdkitWorkerGlobals.substructLibCache) {
    return false;
  }

  if (globalThis.rdkitWorkerGlobals.substructLibCache[name]) {
    // @ts-ignore
    globalThis.rdkitWorkerGlobals.substructLibCache[name].delete();
    delete globalThis.rdkitWorkerGlobals.substructLibCache[name];
  }

  return true;
};

export const cleanSubstructLibCache = () => {
  if (!globalThis.rdkitWorkerGlobals?.substructLibCacheEnabled || !globalThis.rdkitWorkerGlobals.substructLibCache)
    return;
  for (const [name, sslib] of Object.entries(globalThis.rdkitWorkerGlobals.substructLibCache)) {
    // @ts-ignore
    sslib.delete();
    delete globalThis.rdkitWorkerGlobals.substructLibCache[name];
  }
};

export const cleanAllCache = () => {
  cleanJSMolCache();
};
