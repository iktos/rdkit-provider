/* eslint-disable no-var */
import { RDKitModule } from '@rdkit/rdkit';

declare global {
  // TODO remove this once only the worker is loading the script
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
}
