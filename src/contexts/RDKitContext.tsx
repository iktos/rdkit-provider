import { RDKitModule } from '@rdkit/rdkit';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { MAX_CACHED_JSMOLS } from '../constants';
import { cleanAllCache } from '../utils/caching';
import { initWorker } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { broadcastLocalResponse } from '../worker/utils/broadcast';
import { postWorkerJob } from '../worker/utils/postJob';

export interface RDKitContextValue {
  RDKit: RDKitModule | null;
  worker: Worker | null;
}

export type RDKitProviderProps = PropsWithChildren<{
  initialRdkitInstance?: RDKitModule;
  preferCoordgen?: boolean;
  cache?: RDKitProviderCacheOptions;
}>;

// force default context to be undefined, to check if package users have wrapped it with the required provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RDKitContext = React.createContext<RDKitContextValue>(undefined as any);

export const RDKitProvider: React.FC<RDKitProviderProps> = ({
  initialRdkitInstance,
  preferCoordgen = false,
  cache = {},
  children,
}) => {
  const [RDKit, setRDKit] = useState(initialRdkitInstance ?? null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const { enableJsMolCaching, maxJsMolsCached } = cache;

  useEffect(() => {
    let isProviderMounted = true;

    const initialise = async () => {
      let loadedRDKit: RDKitModule | undefined;

      if (!initialRdkitInstance && globalThis.initRDKitModule) {
        loadedRDKit = await globalThis.initRDKitModule();
        loadedRDKit.prefer_coordgen(preferCoordgen);
      }
      const workerInstance = initWorker();
      if (workerInstance) {
        // broadcast worker responses to window to allow for processing multi jobs/responses in parallel
        workerInstance.onmessage = broadcastLocalResponse;
      }
      // await rdkit module init in worker before starting using the worker
      await postWorkerJob(workerInstance, { actionType: RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE, key: 'worker-init' });
      setWorker(workerInstance);

      if (isProviderMounted) {
        if (loadedRDKit) setRDKit(loadedRDKit);

        globalThis.rdkitProviderGlobals = {
          jsMolCacheEnabled: !!enableJsMolCaching,
          jsMolCache: enableJsMolCaching ? {} : null,
          maxJsMolsCached: maxJsMolsCached ?? MAX_CACHED_JSMOLS,
        };
      }
    };

    initialise().catch(console.error);

    return () => {
      isProviderMounted = false;
      cleanAllCache();
    };
  }, [initialRdkitInstance, enableJsMolCaching, maxJsMolsCached, preferCoordgen]);

  return <RDKitContext.Provider value={{ RDKit, worker }}>{children}</RDKitContext.Provider>;
};

interface RDKitProviderCacheOptions {
  enableJsMolCaching?: boolean;
  maxJsMolsCached?: number;
}
