export const initRdkit = async () => {
  //@ts-ignore
  importScripts(`${globalThis.origin}/RDKit_minimal.js`);
  if (!globalThis.initRDKitModule) return;
  await globalThis.initRDKitModule().then((rdkitModule) => {
    globalThis.workerRDKit = rdkitModule;
  });
};
