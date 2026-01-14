# Development Guide for navio-blsct-web

This document describes how to build and develop the browser-compatible BLSCT library.

## Prerequisites

### Required Tools

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **Emscripten SDK** (for WASM compilation)
   ```bash
   # Clone the SDK
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk

   # Install and activate the latest version
   ./emsdk install latest
   ./emsdk activate latest

   # Set up environment (run this in every new terminal session)
   source ./emsdk_env.sh

   # Verify installation
   emcc --version
   ```

## Project Structure

```
ffi/ts-web/
├── src/
│   ├── wasm/           # WASM loading and memory utilities
│   │   ├── loader.ts   # Module initialization
│   │   ├── memory.ts   # Memory management utilities
│   │   └── index.ts    # WASM exports
│   ├── blsct.ts        # Low-level bindings
│   ├── scalar.ts       # Scalar class
│   ├── point.ts        # Point class
│   ├── address.ts      # Address classes
│   ├── keys.ts         # Key derivation
│   ├── tokenId.ts      # Token ID class
│   ├── signature.ts    # Signature class
│   ├── managedObj.ts   # Base class for WASM objects
│   └── index.ts        # Public API exports
├── scripts/
│   └── build-wasm.js   # WASM build script
├── wasm/               # Built WASM files (generated)
├── dist/               # TypeScript output (generated)
├── demo/               # Browser demo
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Building

### 1. Install Dependencies

```bash
npm install
```

### 2. Build WASM Module

First, make sure Emscripten is in your PATH:

```bash
source /path/to/emsdk/emsdk_env.sh
```

Then build the WASM module:

```bash
npm run build:wasm
```

This will:
- Compile the mcl library to WASM
- Compile the bls library to WASM
- Compile libblsct to WASM
- Link everything into a single WASM module
- Output `blsct.js` and `blsct.wasm` to the `wasm/` directory

### 3. Build TypeScript

```bash
npm run build:ts
```

### 4. Build Everything

```bash
npm run build
```

### 5. Create Browser Bundle (optional)

```bash
npm run bundle
```

This creates a single bundled ESM file at `dist/blsct.browser.js`.

## Development Workflow

### Running Tests

```bash
npm test
```

Note: Integration tests that require the WASM module are skipped unless the module is built.

### Watching for Changes

For TypeScript changes, you can use:

```bash
npx tsc --watch
```

### Testing in Browser

1. Build the project
2. Start a local server in the project directory
3. Open `demo/index.html` in your browser

```bash
npm run build
npx serve .
# Open http://localhost:3000/demo/
```

## Architecture Notes

### Memory Management

Objects that wrap WASM pointers extend `ManagedObj` and must be disposed:

```typescript
const scalar = Scalar.random();
// ... use scalar ...
scalar.dispose(); // Free WASM memory
```

For automatic cleanup, use the `using` pattern:

```typescript
Scalar.random().using((scalar) => {
  // scalar is automatically disposed after this callback
  return scalar.toHex();
});
```

### WASM Module Loading

The WASM module must be loaded before any cryptographic operations:

```typescript
import { loadBlsctModule, isModuleLoaded } from 'navio-blsct-web';

// Must be called once at app startup
await loadBlsctModule();

// Check if loaded
if (isModuleLoaded()) {
  // Safe to use library
}
```

### Result Types

Low-level functions return `BlsctResult<T>` for operations that can fail:

```typescript
interface BlsctResult<T> {
  success: boolean;
  value: T | null;
  error?: string;
  errorCode?: number;
}
```

Use `assertSuccess` to unwrap or throw:

```typescript
const result = deserializeScalar(hex);
const ptr = assertSuccess(result, 'Deserialize scalar');
```

## Troubleshooting

### WASM Build Fails

1. Make sure Emscripten is installed and activated:
   ```bash
   emcc --version
   ```

2. Check that navio-core is at the expected path:
   ```bash
   ls ../../navio-core/src/blsct
   ```

3. Check the build output for specific compiler errors

### TypeScript Build Fails

1. Make sure dependencies are installed:
   ```bash
   npm install
   ```

2. Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### Tests Fail

1. Make sure WASM is built:
   ```bash
   npm run build:wasm
   ```

2. Run tests with verbose output:
   ```bash
   npm test -- --verbose
   ```

## Publishing

1. Update version in `package.json`
2. Build everything:
   ```bash
   npm run build
   ```
3. Test:
   ```bash
   npm test
   ```
4. Publish:
   ```bash
   npm publish
   ```

## Related Documentation

- [Emscripten Documentation](https://emscripten.org/docs/)
- [mcl Library](https://github.com/herumi/mcl)
- [BLS Library](https://github.com/herumi/bls)
- [WebAssembly MDN](https://developer.mozilla.org/en-US/docs/WebAssembly)

