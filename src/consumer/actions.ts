import { postWorkerJob } from '../worker';
import { RDKIT_WORKER_ACTIONS } from '../worker/actions';

export const getSvgWithHighlight = (
  worker: Worker,
  { smiles, drawingDetails }: { smiles: string; drawingDetails: string },
) => {
  const key = `${smiles}-${drawingDetails}`;
  return postWorkerJob(worker, {
    actionType: RDKIT_WORKER_ACTIONS.GET_SVG,
    key: key,
    payload: {
      smiles: smiles,
      drawingDetails: drawingDetails,
    },
  });
};
