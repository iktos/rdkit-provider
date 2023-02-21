import { MAX_CACHED_JSMOLS } from '../../constants';
import { RDKitProviderCacheOptions } from '../../contexts';

export const initRdkit = async ({ cache = {} }: InitWorkerOptions) => {
  if (cache) {
    initWorkerCache(cache);
  }
  //@ts-ignore
  importScripts(`${globalThis.origin}/RDKit_minimal.js`);
  if (!globalThis.initRDKitModule) return;
  await globalThis.initRDKitModule().then((rdkitModule) => {
    globalThis.workerRDKit = rdkitModule;
  });
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
  cache?: RDKitProviderCacheOptions;
}
