#!/usr/bin/env node
/**
 * Post-build script to fix browser bundle imports
 * 
 * This script runs after tsc compiles the browser bundle and:
 * 1. Removes Node.js-specific files that were incorrectly included
 * 2. Creates re-export shims that redirect to browser-specific versions
 * 
 * This fixes the issue where files importing from './blsct' get the Node.js
 * version instead of the browser version in the dist/browser/ directory.
 */

const { writeFileSync, existsSync } = require('fs');
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

console.log('Browser build fixed successfully!');

