const initRDKit = async () => {
  if (globalThis.RDKit) return;
  if (!globalThis.initRDKitModule) {
    throw new Error('@iktos/rdkit-provider::initRDKit was used without loading RDKit_minimal.js');
  }
  return globalThis.initRDKitModule().then((RDKit) => {
    globalThis.RDKit = RDKit;
  });
};
export default initRDKit;
