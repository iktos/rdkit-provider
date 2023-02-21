import { JSMol } from '@rdkit/rdkit';

export const storeJSMolInCache = (smiles: string, mol: JSMol) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) return;
  const nbCachedMolecules = Object.keys(globalThis.rdkitWorkerGlobals.jsMolCache).length;
  if (nbCachedMolecules > globalThis.rdkitWorkerGlobals.maxJsMolsCached) {
    cleanJSMolCache();
    globalThis.rdkitWorkerGlobals.jsMolCache = { [smiles]: mol };
    return;
  }
  try {
    globalThis.rdkitWorkerGlobals.jsMolCache[smiles] = mol;
  } catch (e) {
    console.error(e);
    cleanJSMolCache();
    globalThis.rdkitWorkerGlobals.jsMolCache = { [smiles]: mol };
  }
};

export const getJSMolFromCache = (smiles: string) => {
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled || !globalThis.rdkitWorkerGlobals.jsMolCache) {
    return null;
  }
  return globalThis.rdkitWorkerGlobals.jsMolCache[smiles];
};

export const cleanJSMolCache = () => {
  if (!globalThis.rdkitWorkerGlobals?.jsMolCache) return;
  for (const [smiles, mol] of Object.entries(globalThis.rdkitWorkerGlobals.jsMolCache)) {
    try {
      mol.delete();
      delete globalThis.rdkitWorkerGlobals.jsMolCache[smiles];
    } catch {
      // multiple cleanJSMolCache could be called in the same time, => avoid calling delete on the same mol
    }
  }
};

export const cleanAllCache = () => {
  cleanJSMolCache();
};
