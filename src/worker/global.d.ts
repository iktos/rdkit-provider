/* eslint-disable no-var */
import { RDKitModule } from '@rdkit/rdkit';

declare global {
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
  var workerRDKit: RDKitModule;
}
