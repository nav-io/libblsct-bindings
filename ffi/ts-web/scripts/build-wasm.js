#!/usr/bin/env node
/**
 * Build script for compiling libblsct to WebAssembly using Emscripten
 * 
 * Prerequisites:
 * - Emscripten SDK installed and activated (https://emscripten.org/docs/getting_started/downloads.html)
 * - Run `source /path/to/emsdk/emsdk_env.sh` before running this script
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const IS_PROD = process.env.BLSCT_PROD === '1';
const DEV_BRANCH = 'add-missing-functionality';
const NAVIO_CORE_REPO_PROD = 'https://github.com/nav-io/navio-core';
const NAVIO_CORE_REPO_DEV = 'https://github.com/gogoex/navio-core';

const ROOT_DIR = path.resolve(__dirname, '..');
const NAVIO_CORE_DIR = path.resolve(ROOT_DIR, 'navio-core');
const WASM_OUTPUT_DIR = path.resolve(ROOT_DIR, 'wasm');
const BUILD_DIR = path.resolve(ROOT_DIR, 'build-wasm');

// Ensure output directories exist
if (!fs.existsSync(WASM_OUTPUT_DIR)) {
  fs.mkdirSync(WASM_OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

/**
 * Clone navio-core repository if it doesn't exist
 */
function ensureNavioCore() {
  const srcDir = path.join(NAVIO_CORE_DIR, 'src');
  
  if (fs.existsSync(srcDir)) {
    console.log('✓ navio-core already exists');
    return;
  }

  console.log('Cloning navio-core repository...');
  
  // Remove any partial clone
  if (fs.existsSync(NAVIO_CORE_DIR)) {
    fs.rmSync(NAVIO_CORE_DIR, { recursive: true, force: true });
  }

  const repo = IS_PROD ? NAVIO_CORE_REPO_PROD : NAVIO_CORE_REPO_DEV;
  const branch = IS_PROD ? 'master' : DEV_BRANCH;
  
  console.log(`  Repository: ${repo}`);
  console.log(`  Branch: ${branch}`);

  const cloneCmd = [
    'git', 'clone',
    '--depth', '1',
    '--branch', branch,
    repo,
    NAVIO_CORE_DIR
  ];

  const result = spawnSync(cloneCmd[0], cloneCmd.slice(1), { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Failed to clone navio-core: exit code ${result.status}`);
  }

  console.log('✓ navio-core cloned successfully');
}

// Check if emcc is available
function checkEmscripten() {
  try {
    execSync('emcc --version', { stdio: 'pipe' });
    console.log('✓ Emscripten found');
    return true;
  } catch {
    console.error('✗ Emscripten not found. Please install and activate emsdk:');
    console.error('  1. git clone https://github.com/emscripten-core/emsdk.git');
    console.error('  2. cd emsdk && ./emsdk install latest && ./emsdk activate latest');
    console.error('  3. source ./emsdk_env.sh');
    return false;
  }
}

// Source files needed for libblsct WASM build
const BLSCT_SOURCES = [
  'blsct/external_api/blsct.cpp',
  'blsct/arith/elements.cpp',
  'blsct/arith/mcl/mcl_g1point.cpp',
  'blsct/arith/mcl/mcl_scalar.cpp',
  'blsct/bech32_mod.cpp',
  'blsct/building_block/g_h_gi_hi_zero_verifier.cpp',
  'blsct/building_block/generator_deriver.cpp',
  'blsct/building_block/imp_inner_prod_arg.cpp',
  'blsct/building_block/lazy_point.cpp',
  'blsct/building_block/lazy_points.cpp',
  'blsct/building_block/weighted_inner_prod_arg.cpp',
  'blsct/chain.cpp',
  'blsct/common.cpp',
  'blsct/double_public_key.cpp',
  'blsct/eip_2333/bls12_381_keygen.cpp',
  'blsct/key_io.cpp',
  'blsct/pos/helpers.cpp',
  'blsct/pos/pos.cpp',
  'blsct/pos/proof_logic.cpp',
  'blsct/pos/proof.cpp',
  'blsct/private_key.cpp',
  'blsct/public_key.cpp',
  'blsct/public_keys.cpp',
  'blsct/range_proof/common.cpp',
  'blsct/range_proof/generators.cpp',
  'blsct/range_proof/msg_amt_cipher.cpp',
  'blsct/range_proof/proof_base.cpp',
  'blsct/range_proof/bulletproofs_plus/amount_recovery_request.cpp',
  'blsct/range_proof/bulletproofs_plus/amount_recovery_result.cpp',
  'blsct/range_proof/bulletproofs_plus/range_proof.cpp',
  'blsct/range_proof/bulletproofs_plus/range_proof_logic.cpp',
  'blsct/range_proof/bulletproofs_plus/range_proof_with_transcript.cpp',
  'blsct/set_mem_proof/set_mem_proof_prover.cpp',
  'blsct/set_mem_proof/set_mem_proof_setup.cpp',
  'blsct/set_mem_proof/set_mem_proof.cpp',
  'blsct/signature.cpp',
  'blsct/tokens/info.cpp',
  'blsct/tokens/predicate_exec.cpp',
  'blsct/tokens/predicate_parser.cpp',
  'blsct/wallet/address.cpp',
  'blsct/wallet/helpers.cpp',
  'blsct/wallet/keyman.cpp',
  'blsct/wallet/keyring.cpp',
  'blsct/wallet/txfactory_base.cpp',
  'blsct/wallet/txfactory_global.cpp',
  'blsct/wallet/txfactory.cpp',
  'blsct/wallet/verification.cpp',
];

// Additional source files needed
const UTIL_SOURCES = [
  'crypto/hmac_sha256.cpp',
  'crypto/ripemd160.cpp',
  'crypto/sha256.cpp',
  'hash.cpp',
  'primitives/transaction.cpp',
  'script/interpreter.cpp',
  'script/script.cpp',
  'script/script_error.cpp',
  'uint256.cpp',
  'util/strencodings.cpp',
];

// Exported functions for the WASM module
const EXPORTED_FUNCTIONS = [
  '_init',
  '_free_obj',
  '_gen_random_scalar',
  '_gen_scalar',
  '_scalar_to_uint64',
  '_serialize_scalar',
  '_deserialize_scalar',
  '_gen_random_point',
  '_gen_base_point',
  '_serialize_point',
  '_deserialize_point',
  '_is_valid_point',
  '_point_from_scalar',
  '_gen_random_public_key',
  '_scalar_to_pub_key',
  '_gen_double_pub_key',
  '_serialize_dpk',
  '_deserialize_dpk',
  '_encode_address',
  '_decode_address',
  '_gen_token_id',
  '_gen_default_token_id',
  '_serialize_token_id',
  '_deserialize_token_id',
  '_gen_sub_addr_id',
  '_derive_sub_address',
  '_sub_addr_to_dpk',
  '_dpk_to_sub_addr',
  '_serialize_sub_addr',
  '_deserialize_sub_addr',
  '_serialize_sub_addr_id',
  '_deserialize_sub_addr_id',
  '_build_range_proof',
  '_verify_range_proofs',
  '_serialize_range_proof',
  '_deserialize_range_proof',
  '_gen_amount_recovery_req',
  '_recover_amount',
  '_build_tx_in',
  '_build_tx_out',
  '_build_ctx',
  '_get_ctx_id',
  '_serialize_ctx',
  '_deserialize_ctx',
  '_sign_message',
  '_verify_msg_sig',
  '_serialize_signature',
  '_deserialize_signature',
  '_from_seed_to_child_key',
  '_from_child_key_to_blinding_key',
  '_from_child_key_to_token_key',
  '_from_child_key_to_tx_key',
  '_from_tx_key_to_view_key',
  '_from_tx_key_to_spending_key',
  '_calc_priv_spending_key',
  '_calc_view_tag',
  '_calc_nonce',
  '_calc_key_id',
  '_get_blsct_chain',
  '_set_blsct_chain',
  '_gen_out_point',
  '_serialize_out_point',
  '_deserialize_out_point',
  '_malloc',
  '_free',
];

const EXPORTED_RUNTIME_METHODS = [
  'ccall',
  'cwrap',
  'getValue',
  'setValue',
  'UTF8ToString',
  'stringToUTF8',
  'lengthBytesUTF8',
  'stackSave',
  'stackRestore',
  'stackAlloc',
];

function buildMcl() {
  console.log('Building mcl library for WASM...');
  const mclDir = path.join(NAVIO_CORE_DIR, 'src/bls/mcl');
  
  const mclBuildCmd = [
    'emcc',
    '-O3',
    '-DNDEBUG',
    '-DMCL_SIZEOF_UNIT=4',
    '-DMCL_MAX_BIT_SIZE=384',
    '-DMCL_USE_VINT',
    '-DMCL_VINT_FIXED_BUFFER',
    '-DMCL_DONT_USE_OPENSSL',
    '-DMCL_DONT_USE_XBYAK',
    '-DCYBOZU_DONT_USE_EXCEPTION',
    `-I${mclDir}/include`,
    '-c',
    `${mclDir}/src/fp.cpp`,
    '-o', `${BUILD_DIR}/fp.o`
  ].join(' ');

  execSync(mclBuildCmd, { stdio: 'inherit', cwd: BUILD_DIR });
  console.log('✓ mcl built');
}

function buildBls() {
  console.log('Building bls library for WASM...');
  const blsDir = path.join(NAVIO_CORE_DIR, 'src/bls');
  const mclDir = path.join(blsDir, 'mcl');
  
  const blsBuildCmd = [
    'emcc',
    '-O3',
    '-DNDEBUG',
    '-DMCL_SIZEOF_UNIT=4',
    '-DMCL_MAX_BIT_SIZE=384',
    '-DMCL_USE_VINT',
    '-DMCL_VINT_FIXED_BUFFER',
    '-DMCL_DONT_USE_OPENSSL',
    '-DMCL_DONT_USE_XBYAK',
    '-DCYBOZU_DONT_USE_EXCEPTION',
    '-DBLS_ETH',
    `-I${blsDir}/include`,
    `-I${mclDir}/include`,
    '-c',
    `${blsDir}/src/bls_c384_256.cpp`,
    '-o', `${BUILD_DIR}/bls_c384_256.o`
  ].join(' ');

  execSync(blsBuildCmd, { stdio: 'inherit', cwd: BUILD_DIR });
  console.log('✓ bls built');
}

function buildBlsct() {
  console.log('Building libblsct for WASM...');
  const srcDir = path.join(NAVIO_CORE_DIR, 'src');
  const blsDir = path.join(srcDir, 'bls');
  const mclDir = path.join(blsDir, 'mcl');

  const includeFlags = [
    `-I${srcDir}`,
    `-I${blsDir}/include`,
    `-I${mclDir}/include`,
    `-I${srcDir}/univalue/include`,
  ].join(' ');

  const compilerFlags = [
    '-O3',
    '-DNDEBUG',
    '-DLIBBLSCT',
    '-DMCL_SIZEOF_UNIT=4',
    '-DMCL_MAX_BIT_SIZE=384',
    '-DMCL_USE_VINT',
    '-DMCL_VINT_FIXED_BUFFER',
    '-DMCL_DONT_USE_OPENSSL',
    '-DMCL_DONT_USE_XBYAK',
    '-DCYBOZU_DONT_USE_EXCEPTION',
    '-std=c++20',
    '-fno-exceptions',
  ].join(' ');

  // Compile each source file
  const objectFiles = [];
  
  for (const source of BLSCT_SOURCES) {
    const sourcePath = path.join(srcDir, source);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  Warning: Source file not found: ${source}`);
      continue;
    }
    
    const objName = source.replace(/\//g, '_').replace('.cpp', '.o');
    const objPath = path.join(BUILD_DIR, objName);
    
    console.log(`  Compiling ${source}...`);
    const cmd = `emcc ${compilerFlags} ${includeFlags} -c ${sourcePath} -o ${objPath}`;
    
    try {
      execSync(cmd, { stdio: 'pipe', cwd: BUILD_DIR });
      objectFiles.push(objPath);
    } catch (err) {
      console.error(`  Error compiling ${source}:`, err.stderr?.toString() || err.message);
    }
  }

  return objectFiles;
}

function linkWasm(objectFiles) {
  console.log('Linking WASM module...');
  
  const linkFlags = [
    '-O3',
    '-s', 'WASM=1',
    '-s', 'MODULARIZE=1',
    '-s', 'EXPORT_NAME="BlsctModule"',
    '-s', `EXPORTED_FUNCTIONS='${JSON.stringify(EXPORTED_FUNCTIONS)}'`,
    '-s', `EXPORTED_RUNTIME_METHODS='${JSON.stringify(EXPORTED_RUNTIME_METHODS)}'`,
    '-s', 'ALLOW_MEMORY_GROWTH=1',
    '-s', 'INITIAL_MEMORY=16777216',
    '-s', 'MAXIMUM_MEMORY=1073741824',
    '-s', 'STACK_SIZE=1048576',
    '-s', 'ENVIRONMENT=web,worker',
    '-s', 'FILESYSTEM=0',
    '-s', 'SINGLE_FILE=0',
    '--no-entry',
  ].join(' ');

  const allObjects = [
    ...objectFiles,
    `${BUILD_DIR}/fp.o`,
    `${BUILD_DIR}/bls_c384_256.o`,
  ].join(' ');

  const outputJs = path.join(WASM_OUTPUT_DIR, 'blsct.js');
  const cmd = `emcc ${linkFlags} ${allObjects} -o ${outputJs}`;
  
  execSync(cmd, { stdio: 'inherit', cwd: BUILD_DIR });
  console.log(`✓ WASM module created: ${outputJs}`);
}

async function main() {
  console.log('=== Building libblsct for WebAssembly ===\n');

  if (!checkEmscripten()) {
    process.exit(1);
  }

  console.log(`\nNavio Core directory: ${NAVIO_CORE_DIR}`);
  console.log(`WASM output directory: ${WASM_OUTPUT_DIR}`);
  console.log(`Build directory: ${BUILD_DIR}\n`);

  try {
    buildMcl();
    buildBls();
    const objectFiles = buildBlsct();
    
    if (objectFiles.length === 0) {
      console.error('No object files were compiled. Check the source paths.');
      process.exit(1);
    }

    linkWasm(objectFiles);
    
    console.log('\n=== Build complete! ===');
    console.log(`WASM files are in: ${WASM_OUTPUT_DIR}`);
  } catch (err) {
    console.error('\nBuild failed:', err.message);
    process.exit(1);
  }
}

main();

