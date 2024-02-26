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
  getSvgFromReaction,
  buildSubstructLib,
  addSmilesToSubstructLib,
  getMatchesFromSubstructLib,
  deleteSubstructLib,
  getSubstructLibSize,
} from './utils/chem';
import { CIPAtoms, CIPBonds } from './types';

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
        canonicalForm: getCanonicalFormForStructure(data.payload),
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
    case RDKIT_WORKER_ACTIONS.GET_REACTION_SVG:
      responsePayload = {
        svg: getSvgFromReaction(data.payload),
      } satisfies PayloadResponseType<'GET_REACTION_SVG'>;
      break;
    case RDKIT_WORKER_ACTIONS.BUILD_SUBSTRUCT_LIB:
      responsePayload = buildSubstructLib(
        data.payload.sslibName,
        data.payload.replace,
      ) satisfies PayloadResponseType<'BUILD_SUBSTRUCT_LIB'>;
      break;
    case RDKIT_WORKER_ACTIONS.ADD_SMILES_TO_SUBSTRUCT_LIB:
      responsePayload = addSmilesToSubstructLib(
        data.payload.smiles,
        data.payload.sslibName,
        data.payload.trustedSmiles,
      ) satisfies PayloadResponseType<'ADD_SMILES_TO_SUBSTRUCT_LIB'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_MATCHES_FROM_SUBSTRUCT_LIB:
      responsePayload = getMatchesFromSubstructLib(
        data.payload.query,
        data.payload.sslibName,
        data.payload.options,
      ) satisfies PayloadResponseType<'GET_MATCHES_FROM_SUBSTRUCT_LIB'>;
      break;
    case RDKIT_WORKER_ACTIONS.GET_SUBSTRUCT_LIB_SIZE:
      responsePayload = getSubstructLibSize(
        data.payload.sslibName,
      ) satisfies PayloadResponseType<'GET_SUBSTRUCT_LIB_SIZE'>;
      break;
    case RDKIT_WORKER_ACTIONS.DELETE_SUBSTRUCT_LIB:
      responsePayload = deleteSubstructLib(
        data.payload.sslibName,
      ) satisfies PayloadResponseType<'DELETE_SUBSTRUCT_LIB'>;
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
  : ActionType extends 'IS_VALID_SMILES' | 'IS_VALID_SMARTS' | 'IS_VALID_MOLBLOCK'
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
  : ActionType extends 'CONVERT_MOL_NOTATION'
  ? { structure: string | null }
  : ActionType extends 'REMOVE_HS' | 'ADD_HS' | 'GET_NEW_COORDS'
  ? { mdl: string | null }
  : ActionType extends 'GET_STEREO_TAGS'
  ? { CIP_atoms: CIPAtoms; CIP_bonds: CIPBonds }
  : ActionType extends 'GET_REACTION_SVG'
  ? { svg: string | null }
  : ActionType extends 'BUILD_SUBSTRUCT_LIB'
  ? 'REPLACED' | 'CREATED' | 'ALREADY EXISTS'
  : ActionType extends 'ADD_SMILES_TO_SUBSTRUCT_LIB'
  ? number
  : ActionType extends 'GET_MATCHES_FROM_SUBSTRUCT_LIB'
  ? string[]
  : ActionType extends 'GET_SUBSTRUCT_LIB_SIZE'
  ? number
  : ActionType extends 'DELETE_SUBSTRUCT_LIB'
  ? boolean
  : never;
