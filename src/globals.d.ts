/* eslint-disable no-var */
import { RDKitModule } from '@rdkit/rdkit';
import { RDKitProviderGlobals } from './types';

declare global {
  var initRDKitModule: (() => Promise<RDKitModule>) | null;
  var rdkitProviderGlobals: RDKitProviderGlobals;
}
