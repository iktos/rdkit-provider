import { RDKitModule } from '@rdkit/rdkit';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { cleanAllCache } from '../utils/caching';

export interface RDKitContextValue {
  RDKit: RDKitModule | null;
}

export type RDKitProviderProps = PropsWithChildren<{
  initialRdkitInstance?: RDKitModule;
}>;

// force default context to be undefined, to check if package users have wrapped it with the required provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RDKitContext = React.createContext<RDKitContextValue>(undefined as any);

export const RDKitProvider: React.FC<RDKitProviderProps> = ({ initialRdkitInstance, children }) => {
  const [RDKit, setRDKit] = useState(initialRdkitInstance ?? null);

  useEffect(() => {
    let isProviderMounted = true;
    if (!initialRdkitInstance && globalThis.initRDKitModule) {
      globalThis.initRDKitModule().then((loadedRDKit) => {
        if (isProviderMounted) {
          setRDKit(loadedRDKit);
        }
      });
    }
    return () => {
      isProviderMounted = false;
      cleanAllCache();
    };
  }, [initialRdkitInstance]);

  return <RDKitContext.Provider value={{ RDKit }}>{children}</RDKitContext.Provider>;
};
