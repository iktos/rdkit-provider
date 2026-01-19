/*
  MIT License

  Copyright (c) 2023 Iktos

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import { MAX_CACHED_JSMOLS } from '../../constants';
import { RDKitProviderCacheOptions } from '../../contexts';

export const initRdkit = async ({ rdkitPath, preferCoordgen, removeHs, cache = {} }: InitWorkerOptions) => {
  console.log('[rdkit-provider:initRdkit] called with preferCoordgen:', preferCoordgen);
  initWorkerGlobals({ cache, preferCoordgen, removeHs });
  if (globalThis.workerRDKit) {
    // Update preferCoordgen setting even if RDKit is already initialized
    console.log('[rdkit-provider:initRdkit] RDKit already initialized, updating prefer_coordgen to:', preferCoordgen);
    globalThis.workerRDKit.prefer_coordgen(preferCoordgen);
    return;
  }

  const path = rdkitPath || '/RDKit_minimal.js';
  const url = new URL(path, globalThis.origin);
  //@ts-ignore
  importScripts(url);
  if (!globalThis.initRDKitModule) return;
  globalThis.workerRDKit = await globalThis.initRDKitModule();
  console.log('[rdkit-provider:initRdkit] RDKit initialized, setting prefer_coordgen to:', preferCoordgen);
  globalThis.workerRDKit.prefer_coordgen(preferCoordgen);
};

const initWorkerGlobals = ({
  cache,
  preferCoordgen,
  removeHs,
}: {
  cache: RDKitProviderCacheOptions;
  preferCoordgen: boolean;
  removeHs: boolean;
}) => {
  const { enableJsMolCaching, maxJsMolsCached } = cache;
  globalThis.rdkitWorkerGlobals = {
    jsMolCacheEnabled: !!enableJsMolCaching,
    jsMolCache: enableJsMolCaching ? {} : null,
    jsQMolCache: enableJsMolCaching ? {} : null,
    maxJsMolsCached: maxJsMolsCached ?? MAX_CACHED_JSMOLS,
    preferCoordgen,
    removeHs,
  };
};

interface InitWorkerOptions {
  preferCoordgen: boolean;
  removeHs: boolean;
  cache?: RDKitProviderCacheOptions;
  rdkitPath?: string;
}
