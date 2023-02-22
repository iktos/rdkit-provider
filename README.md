# rdkit-provider

Initialises a `RDKitModule` instance from [@rdkit/rdkit](https://github.com/rdkit/rdkit-js) and exposes it via a react context

#### usage

The project using this package needs to provide it with [RDKit_minimal.js](https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js).

Start by adding this line to your `index.html` head

```html
<script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"></script>
```

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

Options that can be passed to  ```RDKitProvider ```:

| prop  | type | functionality | required/optional |
| ------------- | ------------- | ------------- | ------------- |
| cache  | ```RDKitProviderCacheOptions = { enableJsMolCaching?: boolean; maxJsMolsCached?: number; }```  | enables ```JSMol``` caching for better performance | optional  |
| preferCoordgen  | ```boolean```  | will be passed to [@rdkit/rdkitjs prefer_coordgen](https://docs.rdkitjs.com/interfaces/RDKitModule.html#prefer_coordgen.prefer_coordgen-1) to use Schrodinger’s open-source Coordgen library to generate 2D coordinates of molecules | optional  |    
| ```initialRdkitInstance```  | ```RDKitModule``` from ```@rdkit/rdkitjs``` | pass an instance of to expose by the context `RDKitModule`, if not passed rdkit-provider creates one for you  | optional  |

you can consume RDKit in your components by calling `useRDKit`

```js
import { useRDKit } from '@iktos/rdkit-provider';
const Component = () => {
  const { RDKit } = useRDKit();
  const smiles = 'CCC';
  const [isValidSmiles, setIsValidSmiles] = useState();

  useEffect(() => {
    if (!RDKit) return;
    setIsValidSmiles(RDKit.get_mol(smiles).is_valid());
  }, [RDKit]);

  if (!RDKit) 'loading...';
  return <>{isValidSmiles ? 'valid' : 'invalid'}</>;
};
```

You can also make use of a set of helper functions exposed by the package

```js
import { useRDKitUtils } from '@iktos/rdkit-provider';

const Component = () => {
  const { isValidSmiles } = useRDKitUtils();
  const submit = useCallback(
    (smiles) => {
      if (!isValidSmiles(smiles)) return;
      // ...
    },
    [isValidSmiles],
  );

  //...
};
```


Example of usage can be found in [github.com/iktos/molecule-representation](github.com/iktos/molecule-representation)
