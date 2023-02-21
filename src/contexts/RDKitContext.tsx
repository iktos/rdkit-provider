import { RDKitModule } from '@rdkit/rdkit';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { initWorker } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { postWorkerJob } from '../worker/utils/postJob';

export interface RDKitContextValue {
  // TODO remove this and only load rdkit in worker
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

  useEffect(() => {
    let isProviderMounted = true;
    let workerInstance: Worker | null = null;

    const initialise = async () => {
      let loadedRDKit: RDKitModule | undefined;

      if (!initialRdkitInstance && globalThis.initRDKitModule) {
        loadedRDKit = await globalThis.initRDKitModule();
        loadedRDKit.prefer_coordgen(preferCoordgen);
      }
      if (isProviderMounted && loadedRDKit) {
        setRDKit(loadedRDKit);
      }

      workerInstance = initWorker();
      // await rdkit module init in worker before starting using the worker
      await postWorkerJob(workerInstance, {
        actionType: RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE,
        key: 'worker-init',
        payload: { cache },
      });
      setWorker(workerInstance);
    };

    initialise().catch(console.error);

    return () => {
      isProviderMounted = false;
      if (!workerInstance) return;
      postWorkerJob(workerInstance, {
        actionType: RDKIT_WORKER_ACTIONS.TERMINATE,
        key: 'worker-terminate',
      });
    };
  }, [initialRdkitInstance, cache]);

  return <RDKitContext.Provider value={{ RDKit, worker }}>{children}</RDKitContext.Provider>;
};

export interface RDKitProviderCacheOptions {
  enableJsMolCaching?: boolean;
  maxJsMolsCached?: number;
}
