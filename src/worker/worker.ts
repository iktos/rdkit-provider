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

import { cleanAllCache } from './utils/caching';
import {
  getActionLocalResponseIdentifier,
  RDKIT_WORKER_ACTIONS,
  RDKIT_WORKER_ACTIONS_TYPE,
  WorkerMessage,
} from './actions';
import { initRdkit } from './utils/initRDKit';
import {
  getCanonicalFormForStructure,
  getMatchingSubstructure,
  getMoleculeDetails,
  getSvg,
  getSvgFromSmarts,
  hasMatchingSubstructure,
  isValidSmarts,
  isValidSmiles,
} from './utils/chem';

addEventListener('message', async ({ data }: { data: WorkerMessage }) => {
  let responsePayload;
  switch (data.actionType) {
    case RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE:
      await initRdkit(data.payload);
      break;
    case RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS:
      responsePayload = getMoleculeDetails(data.payload.smiles) satisfies PayloadResponseType<'GET_MOLECULE_DETAILS'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE:
      responsePayload = {
        canonicalForm: getCanonicalFormForStructure(data.payload.structure),
      } satisfies PayloadResponseType<'GET_CANONICAL_FORM_FOR_STRUCTURE'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_SVG:
      responsePayload = {
        svg: getSvg(data.payload),
      } satisfies PayloadResponseType<'GET_SVG'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_SVG_FROM_SMARTS:
      responsePayload = {
        svg: getSvgFromSmarts(data.payload),
      } satisfies PayloadResponseType<'GET_SVG_FROM_SMARTS'>;
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMILES:
      responsePayload = {
        isValid: isValidSmiles(data.payload.smiles),
      } satisfies PayloadResponseType<'IS_VALID_SMILES'>;
      break;
    case RDKIT_WORKER_ACTIONS.IS_VALID_SMARTS:
      responsePayload = {
        isValid: isValidSmarts(data.payload.smarts),
      } satisfies PayloadResponseType<'IS_VALID_SMARTS'>;
      break;
    case RDKIT_WORKER_ACTIONS.HAS_MATCHING_SUBSTRUCTURE:
      responsePayload = {
        matching: hasMatchingSubstructure(data.payload),
      } satisfies PayloadResponseType<'HAS_MATCHING_SUBSTRUCTURE'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_SUBSTRUCTURE_MATCH:
      responsePayload = getMatchingSubstructure(data.payload) satisfies PayloadResponseType<'GET_SUBSTRUCTURE_MATCH'>;
      break;
    case RDKIT_WORKER_ACTIONS.TERMINATE:
      cleanAllCache();
      self.close();
      break;
    default:
      return;
  }
  postMessage({
    actionType: getActionLocalResponseIdentifier(data.actionType),
    payload: responsePayload,
    key: data.key,
  });
});

export type PayloadResponseType<ActionType extends RDKIT_WORKER_ACTIONS_TYPE> = ActionType extends
  | 'GET_SVG'
  | 'GET_SVG_FROM_SMARTS'
  ? { svg: string | null }
  : ActionType extends 'IS_VALID_SMILES' | 'IS_VALID_SMARTS'
  ? { isValid: boolean }
  : ActionType extends 'GET_CANONICAL_FORM_FOR_STRUCTURE'
  ? { canonicalForm: string | null }
  : ActionType extends 'HAS_MATCHING_SUBSTRUCTURE'
  ? { matching: boolean }
  : ActionType extends 'GET_SUBSTRUCTURE_MATCH'
  ? { matchingAtoms: number[]; matchingBonds: number[] } | null
  : ActionType extends 'GET_MOLECULE_DETAILS'
  ? {
      numAtoms: number;
      numRings: number;
    } | null
  : never;
