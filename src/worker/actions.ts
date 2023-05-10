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

import { RDKitProviderCacheOptions } from '../contexts';
import { AlignmentDetails, DrawingDetails, MolNotation, SourceMolNotation } from './utils/chem';

export const RDKIT_WORKER_ACTIONS = {
  INIT_RDKIT_MODULE: 'INIT_RDKIT_MODULE',
  LOCAL_RESPONSE: 'LOCAL_RESPONSE',
  BROADCASTED_RESPONSE: 'BROADCASTED_RESPONSE',
  GET_SVG: 'GET_SVG',
  GET_SVG_FROM_SMARTS: 'GET_SVG_FROM_SMARTS',
  GET_MOLECULE_DETAILS: 'GET_MOLECULE_DETAILS',
  GET_CANONICAL_FORM_FOR_STRUCTURE: 'GET_CANONICAL_FORM_FOR_STRUCTURE',
  IS_VALID_SMILES: 'IS_VALID_SMILES',
  IS_VALID_SMARTS: 'IS_VALID_SMARTS',
  HAS_MATCHING_SUBSTRUCTURE: 'HAS_MATCHING_SUBSTRUCTURE',
  GET_SUBSTRUCTURE_MATCH: 'GET_SUBSTRUCTURE_MATCH',
  TERMINATE: 'TERMINATE',
  CONVERT_MOL_NOTATION: 'CONVERT_MOL_NOTATION',
  IS_VALID_MOLBLOCK: 'IS_VALID_MOLBLOCK',
  REMOVE_HS: 'REMOVE_HS',
  ADD_HS: 'ADD_HS',
  GET_NEW_COORDS: 'GET_NEW_COORDS',
} as const;

type ValueOf<T> = T[keyof T];
export type RDKIT_WORKER_ACTIONS_TYPE = ValueOf<typeof RDKIT_WORKER_ACTIONS>;

const RESPONSE_SUFFIX = '_RESPONSE';
const LOCAL_RESPONSE_SUFFIX = '_LOCAL_RESPONSE';
export const getActionResponseIdentifier = (action: RDKIT_WORKER_ACTIONS_TYPE) => action + RESPONSE_SUFFIX;
export const getActionLocalResponseIdentifier = (action: RDKIT_WORKER_ACTIONS_TYPE) => action + LOCAL_RESPONSE_SUFFIX;
export const isLocalResponse = (action: RDKIT_WORKER_ACTIONS_TYPE) => action.includes('LOCAL_RESPONSE');
export const localResponseToResponse = (action: RDKIT_WORKER_ACTIONS_TYPE) =>
  action.replace('LOCAL_RESPONSE', 'RESPONSE');

export type WorkerMessage = WorkerMessageNarrower & WorkerMessageGerneric;

export type WorkerMessageNarrower =
  | {
      actionType: 'INIT_RDKIT_MODULE';
      key: string;
      payload: { rdkitPath?: string; cache?: RDKitProviderCacheOptions; preferCoordgen: boolean; removeHs: boolean };
    }
  | {
      actionType: 'GET_SVG';
      key: string;
      payload: { smiles: string; drawingDetails?: DrawingDetails; alignmentDetails?: AlignmentDetails };
    }
  | {
      actionType: 'GET_SVG_FROM_SMARTS';
      key: string;
      payload: { smarts: string; width: number; height: number };
    }
  | {
      actionType: 'GET_MOLECULE_DETAILS';
      key: string;
      payload: { smiles: string };
    }
  | {
      actionType: 'GET_CANONICAL_FORM_FOR_STRUCTURE';
      key: string;
      payload: { structure: string };
    }
  | {
      actionType: 'IS_VALID_SMILES';
      key: string;
      payload: { smiles: string };
    }
  | {
      actionType: 'IS_VALID_SMARTS';
      key: string;
      payload: { smarts: string };
    }
  | {
      actionType: 'HAS_MATCHING_SUBSTRUCTURE';
      key: string;
      payload: { smiles: string; substructure: string };
    }
  | {
      actionType: 'GET_SUBSTRUCTURE_MATCH';
      key: string;
      payload: { structure: string; substructure: string };
    }
  | {
      actionType: 'TERMINATE';
      key: string;
    }
  | {
      actionType: 'CONVERT_MOL_NOTATION';
      key: string;
      payload: {
        moleculeString: string;
        targetNotation: MolNotation;
        sourceNotation?: SourceMolNotation;
        useQMol?: boolean;
      };
    }
  | {
      actionType: 'IS_VALID_MOLBLOCK';
      key: string;
      payload: { mdl: string };
    }
  | {
      actionType: 'REMOVE_HS';
      key: string;
      payload: { structure: string };
    }
  | {
      actionType: 'ADD_HS';
      key: string;
      payload: { structure: string };
    }
  | {
      actionType: 'GET_NEW_COORDS';
      key: string;
      payload: { structure: string; useCoordGen?: boolean };
    };

export type ActionWorkerMessageNarrowerApplier<ActionType extends RDKIT_WORKER_ACTIONS_TYPE> = {
  actionType: ActionType;
  key: string;
} & WorkerMessageNarrower;

interface WorkerMessageGerneric {
  actionType: RDKIT_WORKER_ACTIONS_TYPE;
  key: string;
  payload?: unknown;
}
