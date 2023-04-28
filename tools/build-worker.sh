#!/bin/bash

# bundle
rm -rf worker-lib/
webpack --mode production --config worker.config.js

# cp assets to lib
version=$(npm pkg get version | tr -d \")
cp ./worker-lib/rdkit-worker.js ./lib/rdkit-worker-${version}.js

# cleanup
rm -R worker-lib
