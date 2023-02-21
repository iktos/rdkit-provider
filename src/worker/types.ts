import { JSMol } from '@rdkit/rdkit';

export interface RDKitWorkerGlobals {
  jsMolCacheEnabled: boolean;
  jsMolCache: Record<string, JSMol> | null;
  maxJsMolsCached: number;
}
