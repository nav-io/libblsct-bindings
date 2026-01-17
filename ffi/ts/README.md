# Navio BLS Confidential Transaction Library

TypeScript bindings for the `libblsct` library used by the [Navio](https://nav.io/) blockchain to construct confidential transactions based on the BLS12-381 curve.

## Features

- **Node.js**: Native C++ bindings for maximum performance
- **Browser**: WebAssembly (WASM) module for browser compatibility

## Requirements

### Node.js
- Node.js v18 or higher
- g++, make, swig, autoconf, automake, libtool and pkg-config to build underlying C++ libraries

### Browser
- Modern browser with WebAssembly support
- No native dependencies required

## Installation

```bash
npm install navio-blsct
```

For Node.js, installation includes building native C++ libraries from source (may take a few minutes).

## Usage

### Node.js

```typescript
import { Scalar, Point, BlsctChain, setChain } from 'navio-blsct';

// Set the network
setChain(BlsctChain.Mainnet);

// Generate a random scalar
const scalar = Scalar.random();
console.log('Random scalar:', scalar.toHex());

// Generate a point from the scalar
const point = Point.fromScalar(scalar);
console.log('Point:', point.toHex());
```

### Browser

For browser usage, import from the `/browser` subpath and initialize the WASM module first:

```typescript
import { loadBlsctModule, Scalar, Point, BlsctChain, setChain } from 'navio-blsct/browser';

// Initialize WASM module (required before using any functions)
await loadBlsctModule();

// Now use the library as normal
setChain(BlsctChain.Mainnet);

const scalar = Scalar.random();
console.log('Random scalar:', scalar.toHex());
```

### Bundler Configuration

If your bundler automatically resolves the `browser` field in `package.json`, you may be able to use the standard import:

```typescript
import { loadBlsctModule, Scalar } from 'navio-blsct';

await loadBlsctModule();
// ...
```

## API Reference

Full API reference and usage examples are available in the [documentation](https://nav-io.github.io/libblsct-bindings/ts/).

## Building from Source

### Node.js (Native)

```bash
cd ffi/ts
npm install
```

### Browser (WASM)

Requires [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) to be installed and activated.

```bash
cd ffi/ts
npm install --ignore-scripts
npm run build:wasm
npm run build:browser
```

## License

MIT
