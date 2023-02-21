import { JSMol, RDKitModule } from '@rdkit/rdkit';
import { cleanJSMolCache, getJSMolFromCache, storeJSMolInCache } from './caching';

const get_molecule_memory_unsafe = (smiles: string, RDKit: RDKitModule) => {
  const cachedMolecule = getJSMolFromCache(smiles);
  if (cachedMolecule) return cachedMolecule;
  if (!smiles) return null;
  if (!RDKit) return null;
  const mol = RDKit.get_mol(smiles);
  storeJSMolInCache(smiles, mol);
  return mol;
};

export const get_molecule = (smiles: string, RDKit: RDKitModule) => {
  try {
    return get_molecule_memory_unsafe(smiles, RDKit);
  } catch (e) {
    // clean cache on possible Runtimeerror OOM
    console.error(e);
    cleanJSMolCache();
    return get_molecule_memory_unsafe(smiles, RDKit);
  }
};

export const release_molecule = (mol: JSMol) => {
  // to be called after every jsMol instanciation via get_molecule call
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled && mol) {
    mol.delete();
  }
};

export const get_molecule_details = ({ smiles }: GetMoleculeDetailsParams, RDKit: RDKitModule | null) => {
  if (!RDKit) return null;
  const mol = get_molecule(smiles, RDKit);
  if (!mol) return null;
  const details = JSON.parse(mol.get_descriptors());
  if (!globalThis.rdkitWorkerGlobals.jsMolCacheEnabled) {
    mol.delete();
  }

  return {
    numAtoms: details.NumHeavyAtoms,
    numRings: details.NumRings,
  };
};

export interface GetMoleculeDetailsParams {
  smiles: string;
}
