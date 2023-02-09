/* eslint-disable no-var */
import { JSMol, RDKitModule } from '@rdkit/rdkit';

export {};

declare global {
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
  var jsMolCache: Record<string, JSMol> | null;
}
