# rdkit-provider

Initialises a web worker with `RDKitModule` instance from [@rdkit/rdkit](https://github.com/rdkit/rdkit-js) and exposes it via a react context

## Setup

#### Assets

The project using this package needs to provide it with [RDKit package assets](https://github.com/rdkit/rdkit/tree/master/Code/MinimalLib#using-the-rdkit-package-assets)

After installing [@rdkit/rdkit](https://github.com/rdkit/rdkit-js) copy to your public folder
`node_modules/@rdkit/rdkit/dist/RDKit_minimal.js` `node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm`

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

| prop                   | type                                                                                      | functionality                                                                                                                                                                                                                        | required/optional |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| cache                  | `RDKitProviderCacheOptions = { enableJsMolCaching?: boolean; maxJsMolsCached?: number; }` | enables `JSMol` caching for better performance                                                                                                                                                                                       | optional          |
| preferCoordgen         | `boolean`                                                                                 | will be passed to [@rdkit/rdkitjs prefer_coordgen](https://docs.rdkitjs.com/interfaces/RDKitModule.html#prefer_coordgen.prefer_coordgen-1) to use Schrodinger’s open-source Coordgen library to generate 2D coordinates of molecules | optional          |
| `initialRdkitInstance` | `RDKitModule` from `@rdkit/rdkitjs`                                                       | pass an instance of to expose by the context `RDKitModule`, if not passed rdkit-provider creates one for you                                                                                                                         | optional          |
| `rdkitWorkerPath`      | `string` default to `/rdkit-worker.js` in `instanciate.ts`                                | pass a custom path to to rdkit worker                                                                                                                                                                                                | optional          |

You can make use of a set of helper functions exposed by the package

```js
import { useRDKitUtils } from '@iktos/rdkit-provider';

const Component = () => {
  const { isValidSmiles } = useRDKitUtils();
  const submit = useCallback(
    async (smiles) => {
      const isValid = await isValidSmiles({ smiles });
      if (!isValid) return;
      // ...
    },
    [isValidSmiles],
  );

  //...
};
```

Example of usage can be found in [github.com/iktos/molecule-representation](github.com/iktos/molecule-representation)
