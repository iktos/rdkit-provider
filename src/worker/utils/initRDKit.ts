import { RDKitModule } from '@rdkit/rdkit';
import { MAX_CACHED_JSMOLS } from '../../constants';
import { RDKitProviderCacheOptions } from '../../contexts';

export const initRdkit = async ({ initialRdkitInstance, preferCoordgen, cache = {} }: InitWorkerOptions) => {
  if (cache) {
    initWorkerCache(cache);
  }

  if (initialRdkitInstance) {
    globalThis.workerRDKit = initialRdkitInstance;
  } else {
    //@ts-ignore
    importScripts(`${globalThis.origin}/RDKit_minimal.js`);
    if (!globalThis.initRDKitModule) return;
    await globalThis.initRDKitModule().then((rdkitModule) => {
      globalThis.workerRDKit = rdkitModule;
    });
  }

  globalThis.workerRDKit.prefer_coordgen(preferCoordgen);
};

const initWorkerCache = (cache: RDKitProviderCacheOptions) => {
  const { enableJsMolCaching, maxJsMolsCached } = cache;
  if (enableJsMolCaching) {
    globalThis.rdkitWorkerGlobals = {
      jsMolCacheEnabled: !!enableJsMolCaching,
      jsMolCache: enableJsMolCaching ? {} : null,
      maxJsMolsCached: maxJsMolsCached ?? MAX_CACHED_JSMOLS,
    };
  }
};

interface InitWorkerOptions {
  preferCoordgen: boolean;
  cache?: RDKitProviderCacheOptions;
  initialRdkitInstance?: RDKitModule;
}
