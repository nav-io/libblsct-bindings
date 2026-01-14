# Navio BLSCT Web Library

Browser-compatible TypeScript/JavaScript bindings for the `libblsct` library used by the [Navio](https://nav.io/) blockchain to construct confidential transactions based on the BLS12-381 curve.

## Features

- 🌐 **Browser Compatible** - Works in modern browsers via WebAssembly
- 🔒 **Confidential Transactions** - Full support for BLSCT cryptographic operations
- 📦 **Zero Dependencies** - Self-contained WASM module
- 🎯 **TypeScript First** - Full type definitions included
- 🧹 **Memory Safe** - Automatic memory management with `ManagedObj` pattern

## Installation

```bash
npm install navio-blsct-web
```

## Requirements

- Modern browser with WebAssembly support (Chrome 57+, Firefox 52+, Safari 11+, Edge 16+)
- Or Node.js 18+ (for server-side usage)

## Quick Start

```typescript
import { 
  loadBlsctModule, 
  Scalar, 
  Point, 
  BlsctChain, 
  setChain,
  DoublePublicKey,
  SubAddress,
  deriveAllKeys,
  disposeAllKeys,
} from 'navio-blsct-web';

// Initialize the WASM module (must be called before any other operations)
await loadBlsctModule();

// Set the network (Mainnet, Testnet, Signet, or Regtest)
setChain(BlsctChain.Mainnet);

// Generate a random seed
const seed = Scalar.random();

// Derive all keys from the seed
const keys = deriveAllKeys(seed);

// Get public keys
const blindingPubKey = keys.blindingKey.toPublicKey();
const spendingPubKey = keys.spendingKey.toPublicKey();

// Derive a sub-address
const subAddress = SubAddress.derive(
  keys.viewKey.ptr,
  spendingPubKey,
  0,  // account
  0   // address index
);

// Get the address string
const addressString = subAddress.toAddress();
console.log('Address:', addressString);

// Clean up (important to prevent memory leaks!)
subAddress.dispose();
disposeAllKeys(keys);
seed.dispose();
```

## Key Concepts

### WASM Module Initialization

The library uses WebAssembly for cryptographic operations. You must initialize the module before using any other functions:

```typescript
import { loadBlsctModule, isModuleLoaded } from 'navio-blsct-web';

// Initialize once at application startup
await loadBlsctModule();

// Check if module is loaded
if (isModuleLoaded()) {
  // Safe to use library functions
}
```

### Memory Management

Objects that wrap WASM memory extend `ManagedObj` and must be disposed when no longer needed:

```typescript
import { Scalar, Point } from 'navio-blsct-web';

// Create objects
const scalar = Scalar.random();
const point = Point.fromScalar(scalar);

// Use them...
console.log(point.toHex());

// Dispose when done
point.dispose();
scalar.dispose();
```

For automatic cleanup, use the `using` pattern:

```typescript
Scalar.random().using((scalar) => {
  const hex = scalar.toHex();
  console.log(hex);
  // scalar is automatically disposed after the callback
});
```

### Network Configuration

Set the blockchain network before generating addresses:

```typescript
import { setChain, getChain, BlsctChain } from 'navio-blsct-web';

setChain(BlsctChain.Mainnet);  // or Testnet, Signet, Regtest

const currentChain = getChain();
```

## API Reference

### Core Types

| Type | Description |
|------|-------------|
| `Scalar` | Field element (private key, blinding factor, etc.) |
| `Point` | Curve point (public key component) |
| `DoublePublicKey` | Pair of public keys (spending + view) |
| `SubAddress` | Stealth address for receiving funds |
| `TokenId` | Token identifier (native or custom tokens) |
| `Signature` | BLS signature |

### Key Derivation

```typescript
import { Scalar, deriveAllKeys, disposeAllKeys } from 'navio-blsct-web';

const seed = Scalar.random();
const keys = deriveAllKeys(seed);

// Access derived keys:
// - keys.childKey
// - keys.blindingKey
// - keys.tokenKey
// - keys.txKey
// - keys.viewKey
// - keys.spendingKey

// Clean up
disposeAllKeys(keys);
seed.dispose();
```

### Signatures

```typescript
import { Scalar, Signature } from 'navio-blsct-web';

const privateKey = Scalar.random();
const publicKeyPtr = privateKey.ptr; // In real usage, derive proper public key

const message = "Hello, BLSCT!";
const signature = Signature.sign(privateKey, message);

// Verify
const isValid = signature.verify(publicKeyPtr, message);

// Serialize
const sigHex = signature.toHex();

// Clean up
signature.dispose();
privateKey.dispose();
```

## Building from Source

### Prerequisites

- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html)
- Node.js 18+
- npm or yarn

### Build Steps

```bash
# Clone the repository
git clone https://github.com/nav-io/libblsct-bindings.git
cd libblsct-bindings/ffi/ts-web

# Install dependencies
npm install

# Build WASM module (requires Emscripten)
source /path/to/emsdk/emsdk_env.sh
npm run build:wasm

# Build TypeScript
npm run build

# Create browser bundle
npm run bundle
```

## Browser Usage

### ES Modules

```html
<script type="module">
  import { loadBlsctModule, Scalar } from './dist/blsct.browser.js';
  
  await loadBlsctModule();
  const scalar = Scalar.random();
  console.log(scalar.toHex());
  scalar.dispose();
</script>
```

### With Bundlers (Webpack, Vite, etc.)

```typescript
// The WASM file needs to be served alongside your bundle
import { loadBlsctModule } from 'navio-blsct-web';

// Configure the WASM path if needed
await loadBlsctModule('/path/to/wasm/blsct.js');
```

## Performance Notes

- WASM initialization takes a few hundred milliseconds
- Cryptographic operations are optimized but still computationally intensive
- Reuse objects when possible to minimize allocation overhead
- Always dispose of objects to prevent memory leaks

## Security Considerations

- Private keys are stored in WASM memory, not JavaScript heap
- Memory is cleared on disposal
- For production use, consider additional security measures for key storage
- This library is for transaction construction; signature verification should be done by a full node

## License

MIT License - See [LICENSE](LICENSE) for details.

## Related Projects

- [navio-blsct](https://www.npmjs.com/package/navio-blsct) - Node.js native bindings (faster, but not browser-compatible)
- [Navio Core](https://github.com/navcoin/navio-core) - Full node implementation

