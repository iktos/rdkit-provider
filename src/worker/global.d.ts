/* eslint-disable no-var */
import { RDKitModule } from '@rdkit/rdkit';
import { RDKitWorkerGlobals } from './types';

declare global {
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
  var workerRDKit: RDKitModule;
  var rdkitWorkerGlobals: RDKitWorkerGlobals;
}
