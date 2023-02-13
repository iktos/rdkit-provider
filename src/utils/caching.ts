import { JSMol } from '@rdkit/rdkit';

export const storeJSMolInCache = (smiles: string, mol: JSMol) => {
  if (!globalThis.rdkitProviderGlobals.jsMolCacheEnabled || !globalThis.rdkitProviderGlobals.jsMolCache) return;
  const nbCachedMolecules = Object.keys(globalThis.rdkitProviderGlobals.jsMolCache).length;
  if (nbCachedMolecules > globalThis.rdkitProviderGlobals.maxJsMolsCached) {
    cleanJSMolCache();
    globalThis.rdkitProviderGlobals.jsMolCache = { [smiles]: mol };
    return;
  }
  try {
    globalThis.rdkitProviderGlobals.jsMolCache[smiles] = mol;
  } catch (e) {
    console.error(e);
    cleanJSMolCache();
    globalThis.rdkitProviderGlobals.jsMolCache = { [smiles]: mol };
  }
};

export const getJSMolFromCache = (smiles: string) => {
  if (globalThis.rdkitProviderGlobals.jsMolCacheEnabled || !globalThis.rdkitProviderGlobals.jsMolCache) {
    return null;
  }
  return globalThis.rdkitProviderGlobals.jsMolCache[smiles];
};

export const cleanJSMolCache = () => {
  if (!globalThis.rdkitProviderGlobals.jsMolCache) return;
  for (const [smiles, mol] of Object.entries(globalThis.rdkitProviderGlobals.jsMolCache)) {
    mol.delete();
    delete globalThis.rdkitProviderGlobals.jsMolCache[smiles];
  }
};

export const cleanAllCache = () => {
  cleanJSMolCache();
};
