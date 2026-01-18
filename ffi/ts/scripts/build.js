const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

// Configuration - always use production navio-core master branch
const NAVIO_CORE_REPO = 'https://github.com/nav-io/navio-core'
const NAVIO_CORE_BRANCH = 'master'

// Linux apt packages required for building
const LINUX_APT_PACKAGES = [
  'swig',
  'autoconf',
  'automake',
  'libtool',
  'pkg-config',
  'git',
  'python3',
  'build-essential'
]

// macOS brew packages required for building
const MACOS_BREW_PACKAGES = [
  'swig',
  'autoconf',
  'automake',
  'libtool',
  'pkg-config',
  'git'
]

// ============================================================================
// Helper Functions
// ============================================================================

function isLinux() {
  return process.platform === 'linux'
}

function isDarwin() {
  return process.platform === 'darwin'
}

function isRoot() {
  return typeof process.getuid === 'function' && process.getuid() === 0
}

// TODO: turn this on for production builds
const IS_PROD = true
const DEV_BRANCH = ''

// git ls-remote https://github.com/nav-io/navio-core.git refs/heads/master
const MASTER_SHA = 'edf9948e91c4b0d92a39b81c6de0b33ce8c9d149'

function hasCmd(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function shouldAllowApt() {
  // Explicit opt-in for non-root runs (e.g., CI images where sudo is available)
  return process.env.BLSCT_BUILD_ALLOW_APT === '1'
}

function isAptPkgInstalled(pkg) {
  if (!hasCmd('dpkg-query')) return false

  try {
    const out = execSync(`dpkg-query -W -f='\${Status}' ${pkg}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()

    return out.includes('install ok installed')
  } catch {
    return false
  }
}

function getMissingAptPkgs(pkgs) {
  return pkgs.filter((p) => !isAptPkgInstalled(p))
}

function ensureLinuxAptDeps(pkgs) {
  if (!isLinux()) return

  const aptAvailable = hasCmd('apt-get') || hasCmd('apt')
  if (!aptAvailable) {
    console.error(
      `[navio-blsct] Linux detected but apt/apt-get not found.\n` +
      `Install system dependencies manually: ${pkgs.join(', ')}\n`
    )
    process.exit(1)
  }

  // If dpkg-query isn't present, we can't reliably check installation status
  const canCheck = hasCmd('dpkg-query')
  const missing = canCheck ? getMissingAptPkgs(pkgs) : pkgs.slice()

  if (missing.length === 0) {
    console.log(`[navio-blsct] System deps already installed.`)
    return
  }

  const installCmd = `apt-get update && apt-get install -y ${missing.join(' ')}`
  const sudoInstallCmd = `sudo ${installCmd}`

  // Non-root default: do not run apt/sudo
  if (!isRoot() && !shouldAllowApt()) {
    console.error(
      `[navio-blsct] Missing system dependencies: ${missing.join(', ')}\n` +
      `This build script will not run apt automatically without privileges.\n\n` +
      `Install them manually, e.g.:\n  ${sudoInstallCmd}\n\n` +
      `Or re-run with:\n  BLSCT_BUILD_ALLOW_APT=1 npm install\n`
    )
    process.exit(1)
  }

  // If non-root but allowed, require sudo
  if (!isRoot() && shouldAllowApt() && !hasCmd('sudo')) {
    console.error(
      `[navio-blsct] BLSCT_BUILD_ALLOW_APT=1 was set but sudo is not available.\n` +
      `Install deps manually or run the build as root.\n` +
      `Missing: ${missing.join(', ')}\n`
    )
    process.exit(1)
  }

  console.log(
    `[navio-blsct] Installing missing Linux system deps via apt: ${missing.join(', ')}`
  )

  execSync(isRoot() ? installCmd : sudoInstallCmd, { stdio: 'inherit' })
}

function ensureMacOSDeps(pkgs) {
  if (!isDarwin()) return

  if (!hasCmd('brew')) {
    console.log('[navio-blsct] Homebrew not found. Assuming dependencies are installed.')
    return
  }

  console.log('[navio-blsct] Installing system dependencies with Homebrew...')
  // brew install is idempotent - it will skip already installed packages
  const result = spawnSync('brew', ['install', ...pkgs], { stdio: 'inherit' })
  if (result.status !== 0) {
    console.warn('[navio-blsct] brew install had non-zero exit, continuing anyway...')
  }
}

// ============================================================================
// Build Configuration
// ============================================================================

const getCfg = () => {
  const baseDir = path.resolve(__dirname, '..')
  const swigDir = path.join(baseDir, 'swig')
  const navioCoreDir = path.join(baseDir, 'navio-core')
  const dependsDir = path.join(navioCoreDir, 'depends')
  const libsDir = path.join(baseDir, 'libs')

  const bakDir = path.join(os.homedir(), '.navio-tmp')
  const dependsBakDir = path.join(bakDir, 'depends')

  const srcPath = path.join(navioCoreDir, 'src')
  const blsPath = path.join(srcPath, 'bls')
  const blsLibPath = path.join(blsPath, 'lib')
  const mclPath = path.join(blsPath, 'mcl')
  const mclLibPath = path.join(mclPath, 'lib')

  const srcDotAFiles = [
    path.join(srcPath, 'libblsct.a'),
    path.join(srcPath, 'libunivalue_blsct.a'),
    path.join(blsLibPath, 'libbls384_256.a'),
    path.join(mclLibPath, 'libmcl.a'),
  ]
  const destDotAFiles = [
    path.join(libsDir, 'libblsct.a'),
    path.join(libsDir, 'libunivalue_blsct.a'),
    path.join(libsDir, 'libbls384_256.a'),
    path.join(libsDir, 'libmcl.a'),
  ]

  return {
    swigDir,
    stdCpp: '-std=c++20',
    navioCoreRepo: NAVIO_CORE_REPO,
    navioCoreBranch: NAVIO_CORE_BRANCH,
    navioCoreDir,
    dependsDir,
    dependsBakDir,

    srcDotAFiles,
    destDotAFiles,
    libsDir,
  }
}

// ============================================================================
// Build Steps
// ============================================================================

const getDepArchDir = (dependsDir) => {
  if (!fs.existsSync(dependsDir)) {
    throw new Error(`${dependsDir} not found`)
  }
  const arches = [
    'x86_64', 'i686', 'mips', 'arm', 'aarch64',
    'powerpc', 'riscv32', 'riscv64', 's390x'
  ]

  const files = fs.readdirSync(dependsDir, { withFileTypes: true })
  for (const file of files) {
    if (
      file.isDirectory() &&
      arches.some(arch => file.name.startsWith(arch))
    ) {
      console.log(`Found dependency arch dir: ${file.name}`)
      return path.resolve(dependsDir, file.name)
    }
  }
  throw new Error(`Failed to find dependency arch dir in ${dependsDir}`)
}

const gitCloneNavioCore = (cfg) => {
  // Remove existing directory
  if (fs.existsSync(cfg.navioCoreDir)) {
    fs.rmSync(cfg.navioCoreDir, { recursive: true, force: true })
    console.log(`Removed existing navio-core dir`)
  } else {
    console.log(`No existing navio-core dir found`)
  }

  const cmd = ['git', 'clone', '--depth', '1', '--branch', cfg.navioCoreBranch, cfg.navioCoreRepo, cfg.navioCoreDir]
  console.log(`Cloning navio-core from ${cfg.navioCoreRepo} (${cfg.navioCoreBranch})...`)

  const res = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit' })
  if (res.status !== 0) {
    throw new Error(`${cmd.join(' ')} failed: exit code ${res.status}`)
  }
  console.log(`✓ navio-core cloned successfully`)
}

const buildDepends = (cfg, numCpus) => {
  if (fs.existsSync(cfg.dependsBakDir)) {
    console.log('Copying the backup of dependency dir...')
    fs.cpSync(cfg.dependsBakDir, cfg.dependsDir, { recursive: true })
  } else {
    console.log('Building navio-core dependencies...')

    const res = spawnSync('make', ['-j', String(numCpus)], { cwd: cfg.dependsDir, stdio: 'inherit' })
    if (res.status !== 0) {
      throw new Error(`Failed to build dependencies: exit code ${res.status}`)
    }
    console.log('Creating backup of depends dir...')
    fs.cpSync(cfg.dependsDir, cfg.dependsBakDir, { recursive: true })
  }
  return getDepArchDir(cfg.dependsDir)
}

const buildLibBlsct = (cfg, numCpus, depArchDir) => {
  // run autogen.sh
  console.log('Running autogen.sh...')
  const autogenRes = spawnSync('./autogen.sh', [], { cwd: cfg.navioCoreDir, stdio: 'inherit' })
  if (autogenRes.status !== 0) {
    throw new Error(`autogen.sh failed: exit code ${autogenRes.status}`)
  }

  // run configure
  console.log(`Running configure...`)
  const configureRes = spawnSync('./configure', [
    `--prefix=${depArchDir}`,
    '--enable-build-libblsct-only'
  ], {
    cwd: cfg.navioCoreDir,
    stdio: 'inherit'
  })
  if (configureRes.status !== 0) {
    throw new Error(`Running configure failed: exit code ${configureRes.status}`)
  }

  // build libblsct
  console.log('Building libblsct...')
  const makeRes = spawnSync('make', ['-j', String(numCpus)], {
    cwd: cfg.navioCoreDir,
    stdio: 'inherit'
  })
  if (makeRes.status !== 0) {
    throw new Error(`Building libblsct failed: exit code ${makeRes.status}`)
  }

  // prepare a fresh libs dir
  if (fs.existsSync(cfg.libsDir)) {
    fs.rmSync(cfg.libsDir, { recursive: true, force: true })
  }
  fs.mkdirSync(cfg.libsDir, { recursive: true })

  // copy .a files to the libs dir
  const src_dest = cfg.srcDotAFiles.map((src, i) => [src, cfg.destDotAFiles[i]])
  for (const [src, dest] of src_dest) {
    console.log(`Copying ${src} to ${dest}...`)
    fs.copyFileSync(src, dest)
  }
}

const buildSwigWrapper = (cfg) => {
  console.log('Building swig wrapper...')
  const res = spawnSync(
    'swig', ['-c++', '-javascript', '-node', 'blsct.i'],
    { cwd: cfg.swigDir, stdio: 'inherit' }
  )
  if (res.status !== 0) {
    throw new Error(`Failed to build swig wrapper: exit code ${res.status}`)
  }
}

// ============================================================================
// Main
// ============================================================================

const main = () => {
  console.log('=== Building navio-blsct native module ===\n')

  const cfg = getCfg()
  const numCpus = os.cpus().length

  // Install system dependencies
  if (isLinux()) {
    ensureLinuxAptDeps(LINUX_APT_PACKAGES)
  } else if (isDarwin()) {
    ensureMacOSDeps(MACOS_BREW_PACKAGES)
  } else {
    console.log(`Platform: ${process.platform} (no automatic dependency installation)`)
  }

  gitCloneNavioCore(cfg)

  // if .a files have been built, copy them from the backup dir
  if (cfg.destDotAFiles.every(file => fs.existsSync(file))) {
    const src_dest = cfg.srcDotAFiles.map((src, i) => [src, cfg.destDotAFiles[i]])
    for (const [src, dest] of src_dest) {
      console.log(`Copying ${dest} to ${src}...`)
      fs.copyFileSync(dest, src)
    }
  }
  // otherwise, build them and create backups
  else {
    const depArchDir = buildDepends(cfg, numCpus)
    buildLibBlsct(cfg, numCpus, depArchDir)
  }

  buildSwigWrapper(cfg)

  console.log('\n=== Build complete! ===')
}

main()
