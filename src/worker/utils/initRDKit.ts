import { MAX_CACHED_JSMOLS } from '../../constants';
import { RDKitProviderCacheOptions } from '../../contexts';

export const initRdkit = async ({ rdkitPath, preferCoordgen, cache = {} }: InitWorkerOptions) => {
  if (cache) {
    initWorkerCache(cache);
  }

  const path = rdkitPath || '/RDKit_minimal.js';
  const url = new URL(path, globalThis.origin);
  //@ts-ignore
  importScripts(url);
  if (!globalThis.initRDKitModule) return;
  await globalThis.initRDKitModule().then((rdkitModule) => {
    globalThis.workerRDKit = rdkitModule;
  });
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
  rdkitPath?: string;
}
