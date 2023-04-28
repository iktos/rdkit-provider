# rdkit-provider

Initialises a web worker with `RDKitModule` instance from [@rdkit/rdkit](https://github.com/rdkit/rdkit-js) and exposes it via a react context

## Setup

#### Assets

The project using this package needs to provide it with [RDKit package assets](https://github.com/rdkit/rdkit/tree/master/Code/MinimalLib#using-the-rdkit-package-assets)

After installing [@rdkit/rdkit](https://github.com/rdkit/rdkit-js) copy to your public folder
`node_modules/@iktos-oss/rdkit-provider/lib/rdkit-worker*.js`
`node_modules/@rdkit/rdkit/dist/RDKit_minimal.js`
`node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm`

## Usage

Wrap your components/App with `RDKitProvider`

```html
import { RDKitProvider } from '@iktos/rdkit-provider';
<RDKitProvider>
  <Component />
</RDKitProvider>
```

you can also enable caching for molecule, which would enhance performance

```html
import { RDKitProvider } from '@iktos/rdkit-provider';
<RDKitProvider cache={{ enableJsMolCaching: true, maxJsMolsCached: 50 }}>
  <Component />
</RDKitProvider>
```

Options that can be passed to `RDKitProvider `:

| prop                    | type                                                                                      | functionality                                                                                                                                                                                                                        | required/optional |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `cache`                   | `RDKitProviderCacheOptions = { enableJsMolCaching?: boolean; maxJsMolsCached?: number; }` | enables `JSMol` caching for better performance                                                                                                                                                                                       | optional          |
| `preferCoordgen`          | `boolean`                                                                                 | will be passed to [@rdkit/rdkitjs prefer_coordgen](https://docs.rdkitjs.com/interfaces/RDKitModule.html#prefer_coordgen.prefer_coordgen-1) to use Schrodinger’s open-source Coordgen library to generate 2D coordinates of molecules | optional          |
| `removeHs`                | `boolean`                                                                                 | toggles removing hydrogens molecules. Defaults to true                                                                                                                                                                               | optional          |
| `initialWorkerInstance` | `Worker` instance of `rdkit-worker.js`                                                    | pass an rdkit worker instance, if not passed rdkit-provider creates one for you                                                                                                                                                      | optional          |
| `rdkitPath`             | `string` default to `/RDKit_minimal.js` in `initRDKit.ts`                                 | pass a custom path to rdkit module                                                                                                                                                                                                   | optional          |
| `rdkitWorkerPublicFolder`       | `string`, default is '', meaning the file is at the root level of the public folder                                | path to the folder containing the rdkit-worker-[version].js relative to the public folder                                                                                                                                                                                                | optional          |

You can make use of a set of helper functions exposed by the package

```js
import { useRDKitUtils, useRDKit } from '@iktos/rdkit-provider';

const Component = () => {
  const { worker } = useRDKit();
  const { isValidSmiles } = useRDKitUtils();
  const submit = useCallback(
    async (smiles) => {
      const { isValid } = await isValidSmiles({ smiles });
      if (!isValid) return;
      // ...
    },
    [isValidSmiles],
  );

  if (!worker) return 'loading ...';
  return <>...</>;
  //...
};
```

Example of usage can be found in [github.com/iktos/molecule-representation](github.com/iktos/molecule-representation)
