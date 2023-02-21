import { getActionLocalResponseIdentifier, RDKIT_WORKER_ACTIONS, WorkerMessage } from './actions';
import { initRdkit } from './utils/initRDKit';
import { getSvg } from './utils/molecule';

addEventListener('message', async ({ data }: { data: WorkerMessage }) => {
  if (data.actionType === RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE) {
    await initRdkit();
    postMessage({
      actionType: getActionLocalResponseIdentifier(RDKIT_WORKER_ACTIONS.INIT_RDKIT_MODULE),
      key: data.key,
    });
    return;
  }
  if (data.actionType === RDKIT_WORKER_ACTIONS.GET_SVG) {
    const svg = getSvg(data.payload?.smiles as string);
    // TODO extract postmessage logic into a function always returning a WorkerMessage type
    postMessage({
      actionType: getActionLocalResponseIdentifier(RDKIT_WORKER_ACTIONS.GET_SVG),
      payload: { svg },
      key: data.key,
    });
    return;
  }
});
