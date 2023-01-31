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

You can choose to pass it your own `RDKitModule` instance by doing

```html
import { RDKitProvider } from '@iktos/rdkit-provider';
<RDKitProvider initialRdkitInstance="{RDKitModule}">
  <Component />
</RDKitProvider>
```

Example of usage can be found in github.com/iktos/molecule-representation
