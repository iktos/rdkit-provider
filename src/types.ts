import { JSMol } from '@rdkit/rdkit';

export interface RDKitProviderGlobals {
  jsMolCacheEnabled: boolean;
  jsMolCache: Record<string, JSMol> | null;
  maxJsMolsCached: number;
}
