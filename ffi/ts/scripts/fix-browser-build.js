#!/usr/bin/env node
/**
 * Post-build script to fix browser bundle imports
 * 
 * This script runs after tsc compiles the browser bundle and:
 * 1. Removes Node.js-specific files that were incorrectly included
 * 2. Creates re-export shims that redirect to browser-specific versions
 * 3. Fixes WASM loader paths for bundler compatibility
 * 
 * This fixes the issue where files importing from './blsct' get the Node.js
 * version instead of the browser version in the dist/browser/ directory.
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');

const browserDir = join(__dirname, '..', 'dist', 'browser');

console.log('Fixing browser build...');

// Files to replace with re-exports
const replacements = [
    {
        name: 'blsct',
        hasDeclaration: true,
    },
    {
        name: 'managedObj',
        hasDeclaration: true,
    },
];

for (const { name, hasDeclaration } of replacements) {
    const jsFile = join(browserDir, `${name}.js`);
    const dtsFile = join(browserDir, `${name}.d.ts`);
    const browserJsFile = join(browserDir, `${name}.browser.js`);

    // Check if browser version exists
    if (!existsSync(browserJsFile)) {
        console.log(`  Skipping ${name} - no browser version found`);
        continue;
    }

    // Check if Node.js version exists and needs replacement
    if (existsSync(jsFile)) {
        console.log(`  Replacing ${name}.js with re-export shim`);

        // Create JS re-export shim
        const jsContent = `// Auto-generated re-export shim for browser build
// This file redirects imports from './${name}' to './${name}.browser'
export * from './${name}.browser.js';
`;
        writeFileSync(jsFile, jsContent, 'utf8');

        // Create d.ts re-export shim
        if (hasDeclaration && existsSync(dtsFile)) {
            const dtsContent = `// Auto-generated re-export shim for browser build
export * from './${name}.browser.js';
`;
            writeFileSync(dtsFile, dtsContent, 'utf8');
        }
    }
}

// Ensure the WASM loader has the correct relative path
// The compiled loader.js uses import.meta.url which should work with bundlers,
// but we need to make sure the path calculation is correct
const loaderFile = join(browserDir, 'bindings', 'wasm', 'loader.js');
if (existsSync(loaderFile)) {
    console.log('  Verifying WASM loader paths...');
    let loaderContent = readFileSync(loaderFile, 'utf8');

    // The loader should use import.meta.url for path resolution
    // Verify it contains the expected pattern
    if (loaderContent.includes('import.meta.url')) {
        console.log('  ✓ WASM loader uses import.meta.url for path resolution');
    } else {
        console.log('  ⚠ WASM loader may need manual path configuration');
    }
}

console.log('Browser build fixed successfully!');

