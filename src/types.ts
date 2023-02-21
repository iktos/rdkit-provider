export interface IsValidSmilesParams {
  smiles: string;
}

export interface IsValidSmartsParams {
  smarts: string;
}

export interface HasMatchingSubstructureParams {
  smiles: string;
  substructure: string;
}

export interface GetMoleculeDetailsParams {
  smiles: string;
}
