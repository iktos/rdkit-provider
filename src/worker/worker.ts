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
  addHs,
  convertMolNotation,
  getCanonicalFormForStructure,
  getMatchingSubstructure,
  getMoleculeDetails,
  getNewCoords,
  getSvg,
  getSvgFromSmarts,
  hasMatchingSubstructure,
  isValidMolBlock,
  isValidSmarts,
  isValidSmiles,
  removeHs,
  getStereoTags,
  isChiral,
  getMorganFp,
} from './utils/chem';
import {
  ConvertMolNotationOutputType,
  Deprecated_GetMoleculeDetailsOutputType,
  GetCanonicalFormOutputType,
  GetMDLOutputType,
  GetMoleculeDetailsOutputType,
  GetMorganFpOutputType,
  GetSteroTagsOutputType,
  GetSubstructureMatchOutputType,
  GetSVGOutputType,
  HasMatchingOutputType,
  IsChiralOutputType,
  IsValidOutputType,
} from '../types';

addEventListener('message', async ({ data }: { data: WorkerMessage }) => {
  let responsePayload;
  switch (data.actionType) {
    case RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE:
      await initRdkit(data.payload);
      break;
    case RDKIT_WORKER_ACTIONS.GET_MOLECULE_DETAILS:
      responsePayload = getMoleculeDetails({
        smiles: data.payload.smiles,
        returnFullDetails: true,
      }) satisfies PayloadResponseType<'GET_MOLECULE_DETAILS'>;
      break;
    case RDKIT_WORKER_ACTIONS.DEPRECATED_GET_MOLECULE_DETAILS:
      console.warn(
        '[DEPRECATED] Using deprecated molecule details retrieval. Please update to the full details API by passing returnFullDetails=true, careful numAtom is now NumHeavyAtom and not NumAtom.',
      );
      responsePayload = getMoleculeDetails({
        smiles: data.payload.smiles,
        returnFullDetails: false,
      }) satisfies PayloadResponseType<'DEPRECATED_GET_MOLECULE_DETAILS'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_CANONICAL_FORM_FOR_STRUCTURE:
      responsePayload = {
        canonicalForm: getCanonicalFormForStructure(data.payload),
      } satisfies PayloadResponseType<'GET_CANONICAL_FORM_FOR_STRUCTURE'>;
      break;
    case RDKIT_WORKER_ACTIONS.IS_CHIRAL:
      responsePayload = isChiral(data.payload.smiles) satisfies PayloadResponseType<'IS_CHIRAL'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_MORGAN_FP:
      responsePayload = getMorganFp(data.payload) satisfies PayloadResponseType<'GET_MORGAN_FP'>;
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
    case RDKIT_WORKER_ACTIONS.IS_VALID_MOLBLOCK:
      responsePayload = {
        isValid: isValidMolBlock(data.payload.mdl),
      } satisfies PayloadResponseType<'IS_VALID_MOLBLOCK'>;
      break;
    case RDKIT_WORKER_ACTIONS.CONVERT_MOL_NOTATION:
      responsePayload = {
        structure: convertMolNotation(data.payload),
      } satisfies PayloadResponseType<'CONVERT_MOL_NOTATION'>;
      break;
    case RDKIT_WORKER_ACTIONS.ADD_HS:
      responsePayload = {
        mdl: addHs(data.payload.structure),
      } satisfies PayloadResponseType<'ADD_HS'>;
      break;
    case RDKIT_WORKER_ACTIONS.REMOVE_HS:
      responsePayload = {
        mdl: removeHs(data.payload.structure),
      } satisfies PayloadResponseType<'REMOVE_HS'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_NEW_COORDS:
      responsePayload = {
        mdl: getNewCoords(data.payload.structure, data.payload.useCoordGen),
      } satisfies PayloadResponseType<'GET_NEW_COORDS'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_STEREO_TAGS:
      responsePayload = {
        ...getStereoTags(data.payload.structure),
      } satisfies PayloadResponseType<'GET_STEREO_TAGS'>;
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
  ? GetSVGOutputType
  : ActionType extends 'IS_CHIRAL'
  ? IsChiralOutputType
  : ActionType extends 'GET_MORGAN_FP'
  ? GetMorganFpOutputType
  : ActionType extends 'IS_VALID_SMILES' | 'IS_VALID_SMARTS' | 'IS_VALID_MOLBLOCK'
  ? IsValidOutputType
  : ActionType extends 'GET_CANONICAL_FORM_FOR_STRUCTURE'
  ? GetCanonicalFormOutputType
  : ActionType extends 'HAS_MATCHING_SUBSTRUCTURE'
  ? HasMatchingOutputType
  : ActionType extends 'GET_SUBSTRUCTURE_MATCH'
  ? GetSubstructureMatchOutputType
  : ActionType extends 'GET_MOLECULE_DETAILS'
  ? GetMoleculeDetailsOutputType
  : ActionType extends 'DEPRECATED_GET_MOLECULE_DETAILS'
  ? Deprecated_GetMoleculeDetailsOutputType
  : ActionType extends 'CONVERT_MOL_NOTATION'
  ? ConvertMolNotationOutputType
  : ActionType extends 'REMOVE_HS' | 'ADD_HS' | 'GET_NEW_COORDS'
  ? GetMDLOutputType
  : ActionType extends 'GET_STEREO_TAGS'
  ? GetSteroTagsOutputType
  : never;
