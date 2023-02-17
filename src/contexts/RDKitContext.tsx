import { RDKitModule } from '@rdkit/rdkit';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { MAX_CACHED_JSMOLS } from '../constants';
import { cleanAllCache } from '../utils/caching';

export interface RDKitContextValue {
  RDKit: RDKitModule | null;
}

export type RDKitProviderProps = PropsWithChildren<{
  initialRdkitInstance?: RDKitModule;
  cache?: RDKitProviderCacheOptions;
}>;

// force default context to be undefined, to check if package users have wrapped it with the required provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RDKitContext = React.createContext<RDKitContextValue>(undefined as any);

export const RDKitProvider: React.FC<RDKitProviderProps> = ({ initialRdkitInstance, cache = {}, children }) => {
  const [RDKit, setRDKit] = useState(initialRdkitInstance ?? null);
  const { enableJsMolCaching, maxJsMolsCached } = cache;

  useEffect(() => {
    let isProviderMounted = true;

    const initialise = async () => {
      let loadedRDKit: RDKitModule | undefined;

      if (!initialRdkitInstance && globalThis.initRDKitModule) {
        loadedRDKit = await globalThis.initRDKitModule();
      }

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
  }, [initialRdkitInstance, enableJsMolCaching, maxJsMolsCached]);

  return <RDKitContext.Provider value={{ RDKit }}>{children}</RDKitContext.Provider>;
};

interface RDKitProviderCacheOptions {
  enableJsMolCaching?: boolean;
  maxJsMolsCached?: number;
}
