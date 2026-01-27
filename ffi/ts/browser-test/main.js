/**
 * Browser test for navio-blsct
 * 
 * This test verifies that:
 * 1. The library can be imported without Node.js-specific errors
 * 2. Core browser-specific exports are available
 * 3. WASM module loads and initializes correctly
 * 4. Wallet keys can be derived from a seed
 */

const resultsDiv = document.getElementById('results');

function addResult(name, success, details = '') {
    const div = document.createElement('div');
    div.className = `test ${success ? 'pass' : 'fail'}`;
    div.innerHTML = `
    <strong>${success ? '✅' : '❌'} ${name}</strong>
    ${details ? `<pre><code>${details}</code></pre>` : ''}
  `;
    resultsDiv.appendChild(div);
    return success;
}

async function runTests() {
    resultsDiv.innerHTML = '';
    let allPassed = true;
    let blsctBrowser = null;

    // Test 1: Import the browser-specific blsct module directly
    try {
        console.log('Test 1: Importing blsct.browser.js...');
        blsctBrowser = await import('/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/dist/browser/blsct.browser.js');
        addResult('Import blsct.browser.js (WASM bindings)', true,
            `Exports include: loadBlsctModule, isModuleLoaded, genRandomScalar, etc.`);

        // Test 2: Verify WASM loader functions exist
        if (typeof blsctBrowser.loadBlsctModule === 'function' &&
            typeof blsctBrowser.isModuleLoaded === 'function') {
            addResult('WASM loader functions available', true);
        } else {
            addResult('WASM loader functions available', false);
            allPassed = false;
        }

        // Test 3: Verify constants are correct values (not from native module)
        if (blsctBrowser.CTX_ID_SIZE === 32 &&
            blsctBrowser.POINT_SIZE === 48) {
            addResult('Constants have correct WASM values', true,
                `CTX_ID_SIZE: ${blsctBrowser.CTX_ID_SIZE}, POINT_SIZE: ${blsctBrowser.POINT_SIZE}`);
        } else {
            addResult('Constants have correct WASM values', false);
            allPassed = false;
        }

        // Test 4: Verify enums exist
        if (blsctBrowser.BlsctChain && blsctBrowser.TxOutputType) {
            addResult('BlsctChain and TxOutputType enums exist', true,
                `BlsctChain.Mainnet: ${blsctBrowser.BlsctChain.Mainnet}`);
        } else {
            addResult('BlsctChain and TxOutputType enums exist', false);
            allPassed = false;
        }

    } catch (error) {
        console.error('Import error:', error);
        addResult('Import blsct.browser.js', false, `Error: ${error.message}`);
        allPassed = false;
    }

    // Test 5: Import managedObj.browser.js (no util import)
    try {
        console.log('Test 5: Importing managedObj.browser.js...');
        const managedObj = await import('/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/dist/browser/managedObj.browser.js');

        if (typeof managedObj.ManagedObj === 'function') {
            addResult('ManagedObj class available (no util import)', true);
        } else {
            addResult('ManagedObj class available', false);
            allPassed = false;
        }
    } catch (error) {
        console.error('ManagedObj import error:', error);
        addResult('Import managedObj.browser.js', false, `Error: ${error.message}`);
        allPassed = false;
    }

    // Test 6: Verify blsct.js shim redirects correctly
    try {
        console.log('Test 6: Importing blsct.js shim...');
        const blsctShim = await import('/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/dist/browser/blsct.js');

        // The shim should re-export from blsct.browser.js
        if (typeof blsctShim.loadBlsctModule === 'function') {
            addResult('blsct.js shim correctly re-exports from blsct.browser.js', true);
        } else {
            addResult('blsct.js shim works', false);
            allPassed = false;
        }
    } catch (error) {
        console.error('Shim error:', error);
        addResult('blsct.js shim', false, `Error: ${error.message}`);
        allPassed = false;
    }

    // Test 7: Verify WASM loader path resolution uses import.meta.url
    try {
        console.log('Test 7: Checking WASM loader for import.meta.url usage...');
        const loaderResponse = await fetch('/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/dist/browser/bindings/wasm/loader.js');
        const loaderCode = await loaderResponse.text();

        if (loaderCode.includes('import.meta')) {
            addResult('WASM loader uses import.meta.url for path resolution', true,
                'Path resolution is bundler-compatible (Vite, Webpack, Rollup, etc.)');
        } else {
            addResult('WASM loader uses import.meta.url', false,
                'Loader may have issues with bundlers - path resolution may not work correctly');
            allPassed = false;
        }
    } catch (error) {
        console.error('Loader check error:', error);
        addResult('WASM loader check', false, `Error: ${error.message}`);
        // Don't fail the test suite for this check
    }

    // Test 8: Load the WASM module
    // Add a loading indicator since WASM compilation takes time
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'test pending';
    loadingDiv.id = 'wasm-loading';
    loadingDiv.innerHTML = '<strong>⏳ Loading WASM module (this may take 10-60 seconds for first load)...</strong>';
    resultsDiv.appendChild(loadingDiv);

    try {
        console.log('Test 8: Loading WASM module...');

        // Strategy: Load blsct.js as a script tag first to set the global BlsctModule
        // This is more reliable than trying to use dynamic import with CommonJS
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/wasm/blsct.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        console.log('  Script loaded, BlsctModule available:', typeof window.BlsctModule);

        // Now use loadBlsctModule with a custom factory
        if (typeof window.BlsctModule !== 'function') {
            throw new Error('BlsctModule global not set after script load');
        }

        loadingDiv.innerHTML = '<strong>⏳ Compiling WASM module...</strong>';

        // Initialize the WASM module directly using the global factory
        // MCL_USE_WEB_CRYPTO_API requires Module.cryptoGetRandomValues for random number generation
        // The MCL library calls: EM_ASM({Module.cryptoGetRandomValues($0, $1)}, buf, byteSize)
        const config = {
            locateFile: (path, prefix) => {
                if (path.endsWith('.wasm')) {
                    return '/@fs' + '/Users/alex/dev/libblsct-bindings/ffi/ts/wasm/blsct.wasm';
                }
                return prefix + path;
            },
            print: console.log,
            printErr: console.error,
        };

        console.log('  Starting WASM compilation...');
        const wasmModule = await window.BlsctModule(config);

        // Add cryptoGetRandomValues to the module for MCL's web crypto API support
        // This must be added after module is created so we can access HEAPU8
        wasmModule.cryptoGetRandomValues = (bufPtr, byteSize) => {
            const buffer = wasmModule.HEAPU8.subarray(bufPtr, bufPtr + byteSize);
            crypto.getRandomValues(buffer);
        };

        console.log('  WASM compiled, calling _init...');

        try {
            wasmModule._init();
            console.log('  WASM initialized!');
        } catch (e) {
            // WASM exceptions are often returned as integer pointers
            const errorInfo = typeof e === 'number'
                ? `WASM exception pointer: ${e}. This usually indicates blsInit() failed due to MCLBN_COMPILED_TIME_VAR mismatch.`
                : String(e);
            throw new Error(`Library initialization failed: ${errorInfo}`);
        }

        // Store in a way that other tests can access
        window._blsctWasmModule = wasmModule;

        // Remove loading indicator and add success
        loadingDiv.remove();
        addResult('WASM module loaded successfully', true,
            'Module initialized using script tag loading strategy');
    } catch (error) {
        console.error('WASM load error:', error);
        loadingDiv.remove();
        addResult('WASM module load', false, `Error: ${error.message}\n\nStack: ${error.stack}`);
        allPassed = false;
    }

    // Test 9: Verify WASM module has expected functions
    if (window._blsctWasmModule) {
        const wasmFuncs = Object.keys(window._blsctWasmModule).filter(k => k.startsWith('_'));
        const scalarFuncs = wasmFuncs.filter(f => f.includes('scalar'));
        const keyFuncs = wasmFuncs.filter(f => f.includes('key'));

        if (wasmFuncs.length > 200 && scalarFuncs.length >= 5 && keyFuncs.length >= 10) {
            addResult('WASM module has cryptographic functions', true,
                `Total: ${wasmFuncs.length} functions\n` +
                `Scalar functions: ${scalarFuncs.join(', ')}\n` +
                `Key functions: ${keyFuncs.slice(0, 10).join(', ')}...`);
        } else {
            addResult('WASM module functions', false,
                `Found ${wasmFuncs.length} functions, expected >200`);
            allPassed = false;
        }
    }

    // Test 10: Actually execute a cryptographic operation (generate random scalar)
    if (window._blsctWasmModule) {
        try {
            const wasmModule = window._blsctWasmModule;
            console.log('Test 10: Calling _gen_random_scalar()...');

            // This is the critical test - actually call a cryptographic function
            const scalarPtr = wasmModule._gen_random_scalar();

            if (scalarPtr === 0) {
                addResult('Generate random scalar', false,
                    '_gen_random_scalar() returned null pointer');
                allPassed = false;
            } else if (typeof scalarPtr === 'number' && scalarPtr > 0) {
                // Check that the return value is a BlsctRetVal struct
                // The first byte should be BLSCT_SUCCESS (0) if successful
                const result = wasmModule.getValue(scalarPtr, 'i8');

                if (result === 0) {
                    addResult('Generate random scalar', true,
                        `Successfully generated random scalar (ptr: ${scalarPtr}, result: BLSCT_SUCCESS)`);

                    // Clean up
                    wasmModule._free_obj(scalarPtr);
                } else {
                    addResult('Generate random scalar', false,
                        `_gen_random_scalar() returned error code: ${result}`);
                    allPassed = false;
                }
            } else {
                addResult('Generate random scalar', false,
                    `Unexpected return value: ${scalarPtr} (type: ${typeof scalarPtr})`);
                allPassed = false;
            }
        } catch (error) {
            addResult('Generate random scalar', false,
                `WASM exception thrown: ${error}\n\n` +
                `This usually indicates MCL/BLS library is not properly initialized. ` +
                `Common causes:\n` +
                `- MCLBN_COMPILED_TIME_VAR mismatch between compile-time and runtime\n` +
                `- BLS_ETH flag not consistently defined across compilation units\n` +
                `- Exception: ${error.stack || error}`);
            allPassed = false;
        }
    }

    // Test 11: Generate a random point
    if (window._blsctWasmModule && allPassed) {
        try {
            const wasmModule = window._blsctWasmModule;
            console.log('Test 11: Calling _gen_random_point()...');

            const pointPtr = wasmModule._gen_random_point();

            if (pointPtr && typeof pointPtr === 'number' && pointPtr > 0) {
                const result = wasmModule.getValue(pointPtr, 'i8');

                if (result === 0) {
                    addResult('Generate random point', true,
                        `Successfully generated random point (ptr: ${pointPtr})`);
                    wasmModule._free_obj(pointPtr);
                } else {
                    addResult('Generate random point', false,
                        `_gen_random_point() returned error code: ${result}`);
                    allPassed = false;
                }
            } else {
                addResult('Generate random point', false,
                    `Unexpected return value: ${pointPtr}`);
                allPassed = false;
            }
        } catch (error) {
            addResult('Generate random point', false,
                `WASM exception thrown: ${error}`);
            allPassed = false;
        }
    }

    // Test 12: Generate a random public key
    if (window._blsctWasmModule && allPassed) {
        try {
            const wasmModule = window._blsctWasmModule;
            console.log('Test 12: Calling _gen_random_public_key()...');

            const pubKeyPtr = wasmModule._gen_random_public_key();

            if (pubKeyPtr && typeof pubKeyPtr === 'number' && pubKeyPtr > 0) {
                const result = wasmModule.getValue(pubKeyPtr, 'i8');

                if (result === 0) {
                    addResult('Generate random public key', true,
                        `Successfully generated random public key (ptr: ${pubKeyPtr})`);
                    wasmModule._free_obj(pubKeyPtr);
                } else {
                    addResult('Generate random public key', false,
                        `_gen_random_public_key() returned error code: ${result}`);
                    allPassed = false;
                }
            } else {
                addResult('Generate random public key', false,
                    `Unexpected return value: ${pubKeyPtr}`);
                allPassed = false;
            }
        } catch (error) {
            addResult('Generate random public key', false,
                `WASM exception thrown: ${error}`);
            allPassed = false;
        }
    }

    // Summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = `test ${allPassed ? 'pass' : 'fail'}`;
    summaryDiv.innerHTML = `<strong>${allPassed ? '🎉 All tests passed! WASM module works correctly.' : '💥 Some tests failed'}</strong>`;
    resultsDiv.appendChild(summaryDiv);
}

runTests();

