import { RDKitProviderCacheOptions } from '../contexts';
import { cleanAllCache } from '../utils';
import { getActionLocalResponseIdentifier, RDKIT_WORKER_ACTIONS, WorkerMessage } from './actions';
import { initRdkit } from './utils/initRDKit';
import { getSvg } from './utils/molecule';

addEventListener('message', async ({ data }: { data: WorkerMessage }) => {
  if (data.actionType === RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE) {
    // TODO remove as ... once narrowing is implemented
    await initRdkit({ cache: data.payload?.cache as RDKitProviderCacheOptions });
    postMessage({
      actionType: getActionLocalResponseIdentifier(RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE),
      key: data.key,
    });
    return;
  }
  if (data.actionType === RDKIT_WORKER_ACTIONS.GET_SVG) {
    if (!data.payload) return;
    // TODO remove as ... once narrowing is implemented
    const svg = getSvg(data.payload.smiles as string, data.payload.drawingDetails as string);
    // TODO extract postmessage logic into a function always returning a WorkerMessage type
    postMessage({
      actionType: getActionLocalResponseIdentifier(RDKIT_WORKER_ACTIONS.GET_SVG),
      payload: { svg },
      key: data.key,
    });
    return;
  }
  if (data.actionType === RDKIT_WORKER_ACTIONS.TERMINATE) {
    cleanAllCache();
    self.close();
    postMessage({
      actionType: getActionLocalResponseIdentifier(RDKIT_WORKER_ACTIONS.TERMINATE),
      key: data.key,
    });
    return;
  }
});
