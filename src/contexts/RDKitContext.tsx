import React, { PropsWithChildren, useEffect, useState } from 'react';
import { initWorker } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { postWorkerJob } from '../worker/utils/postJob';

export interface RDKitContextValue {
  worker: Worker | null;
}

export type RDKitProviderProps = PropsWithChildren<{
  cache?: RDKitProviderCacheOptions;
}>;

// force default context to be undefined, to check if package users have wrapped it with the required provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RDKitContext = React.createContext<RDKitContextValue>(undefined as any);

export const RDKitProvider: React.FC<RDKitProviderProps> = ({ cache = {}, children }) => {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    let isProviderMounted = true;
    let workerInstance: Worker | null = null;

    const initialise = async () => {
      workerInstance = initWorker();
      // await rdkit module init in worker before starting using the worker
      await postWorkerJob(workerInstance, {
        actionType: RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE,
        key: 'worker-init',
        payload: { cache },
      });
      if (isProviderMounted && workerInstance) {
        setWorker(workerInstance);
      }
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
  }, [cache]);

  return <RDKitContext.Provider value={{ worker }}>{children}</RDKitContext.Provider>;
};

export interface RDKitProviderCacheOptions {
  enableJsMolCaching?: boolean;
  maxJsMolsCached?: number;
}
