import { useContext } from 'react';

import { RDKitContext } from '../contexts';

export const useRDKit = () => {
  const loadRDKitContext = useContext(RDKitContext);
  if (!loadRDKitContext) {
    throw new Error('@iktos-oss/rdkit-provider was used outside of RDKitProvider');
  }

  return loadRDKitContext;
};
