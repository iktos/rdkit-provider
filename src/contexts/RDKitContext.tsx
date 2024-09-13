/*
  MIT License

  Copyright (c) 2023 Iktos

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { initWorker } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';
import { postWorkerJob } from '../worker/utils/postJob';

export interface RDKitContextValue {
  workers: Worker[];
}

export type RDKitProviderProps = PropsWithChildren<{
  cache?: RDKitProviderCacheOptions;
  initialWorkerInstances?: Worker[];
  numWorkers?: number;
  preferCoordgen?: boolean;
  removeHs?: boolean;
  rdkitPath?: string;
  rdkitWorkerPublicFolder?: string;
}>;

// force default context to be undefined, to check if package users have wrapped it with the required provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RDKitContext = React.createContext<RDKitContextValue>(undefined as any);

export const RDKitProvider: React.FC<RDKitProviderProps> = ({
  cache,
  initialWorkerInstances = [],
  numWorkers = 1,
  preferCoordgen = false,
  removeHs = true,
  rdkitPath,
  rdkitWorkerPublicFolder,
  children,
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    let isProviderMounted = true;
    let workerInstances = initialWorkerInstances;

    const initialise = async () => {
      if (workerInstances.length < numWorkers) {
        const additionalWorkers = Array.from({ length: numWorkers - workerInstances.length }, () =>
          initWorker(rdkitWorkerPublicFolder),
        );
        workerInstances = [...workerInstances, ...additionalWorkers];
      }

      console.log('workerInstances', workerInstances);

      await Promise.all(
        workerInstances.map((worker) =>
          postWorkerJob(worker, {
            actionType: RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE,
            key: 'worker-init',
            payload: { rdkitPath, cache, preferCoordgen, removeHs },
          }),
        ),
      );

      if (isProviderMounted) {
        setWorkers(workerInstances);
      }
    };

    initialise().catch(console.error);

    return () => {
      isProviderMounted = false;
      workerInstances.forEach((worker) => {
        postWorkerJob(worker, {
          actionType: RDKIT_WORKER_ACTIONS.TERMINATE,
          key: 'worker-terminate',
        });
      });
    };
    // TODO FIXME
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numWorkers, cache, preferCoordgen, rdkitPath, rdkitWorkerPublicFolder, removeHs]);

  return <RDKitContext.Provider value={{ workers }}>{children}</RDKitContext.Provider>;
};

export interface RDKitProviderCacheOptions {
  enableJsMolCaching?: boolean;
  maxJsMolsCached?: number;
}
