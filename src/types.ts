import { type CIPBonds, type CIPAtoms } from './worker/types';
import { type DeprecatedMoleculeBasicDetails, type Descriptors } from './worker/utils/chem';

export type RDKitColor = [number, number, number] | [number, number, number, number];

/** output types */
export type GetSVGOutputType = { svg: string | null };
export type IsChiralOutputType = boolean;
export type GetMorganFpOutputType = string;
export type IsValidOutputType = { isValid: boolean };
export type GetCanonicalFormOutputType = { canonicalForm: string | null };
export type HasMatchingOutputType = { matching: boolean };
export type GetSubstructureMatchOutputType = { matchingAtoms: number[]; matchingBonds: number[] } | null;
export type GetMoleculeDetailsOutputType = Descriptors | null;
export type Deprecated_GetMoleculeDetailsOutputType = DeprecatedMoleculeBasicDetails | null;
export type ConvertMolNotationOutputType = { structure: string | null };
export type GetMDLOutputType = { mdl: string | null };
export type GetSteroTagsOutputType = { CIP_atoms: CIPAtoms; CIP_bonds: CIPBonds };
/** output types */
