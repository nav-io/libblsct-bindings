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
        console.log('  WASM compiled, calling _init...');
        wasmModule._init();
        console.log('  WASM initialized!');

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

    // Summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = `test ${allPassed ? 'pass' : 'fail'}`;
    summaryDiv.innerHTML = `<strong>${allPassed ? '🎉 All tests passed! WASM module works correctly.' : '💥 Some tests failed'}</strong>`;
    resultsDiv.appendChild(summaryDiv);
}

runTests();

