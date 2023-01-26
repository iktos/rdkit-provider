/* eslint-disable no-var */
import { RDKitModule } from '@rdkit/rdkit';

export {};

declare global {
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
}
