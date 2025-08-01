const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

// TODO: turn this on for production builds
const IS_PROD = true

const getCfg = (isProd) => {
  baseDir = path.resolve(__dirname, '..')
  swigDir = path.join(baseDir, 'swig')
  libDir = path.join(baseDir, 'lib')
  navioCoreDir = path.join(baseDir, 'navio-core')
  dependsDir = path.join(navioCoreDir, 'depends')
  dependsBakDir = path.join(baseDir, 'depends')

  srcPath = path.join(navioCoreDir, "src")
  blsPath = path.join(srcPath, "bls")
  blsLibPath = path.join(blsPath, "lib")
  mclPath = path.join(blsPath, "mcl")
  mclLibPath = path.join(mclPath, "lib")

  const libFiles = [
    path.join(srcPath, "libblsct.a"),
    path.join(srcPath, "libunivalue_blsct.a"),
    path.join(blsLibPath, "libbls384_256.a"),
    path.join(mclLibPath, "libmcl.a"),
  ]
  return {
    swigDir,
    libDir,
    stdCpp: '-std=c++20',
    navioCoreRepo: isProd ? 'https://github.com/nav-io/navio-core' : 'https://github.com/gogoex/navio-core',
    navioCoreBranch: isProd ? '' : '', // 'development-branch-name'
    navioCoreDir,
    dependsDir,
    dependsBakDir,
    libFiles,
  }
}

const exec = (cmd) => {
  const isRoot = process.getuid && process.getuid() === 0
  if (!isRoot) {
    cmd = ['sudo', ...cmd]
  }
  const res = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit' })
  if (res.status !== 0) {
    throw new Error(`Failed to execute ${cmd.join(' ')}: ${JSON.stringify(res)}`)
  }
}

const detectPkgManager = () => {
  const exists = (cmd) => {
    const res = spawnSync('which', [cmd])
    return res.status === 0
  }
  if (exists('apt-get')) {
    return 'apt-get'
  } else if (exists('dnf')) {
    return 'dnf'
  } else {
    return undefined
  }
}

const installSystemDeps = () => {
  const platform = os.platform()
  console.log(`Platform: ${platform}`)

  if (platform === 'darwin') {
    console.log('Installing system dependencies w/ brew...')
    spawnSync('brew', ['install', 'swig', 'autoconf', 'automake', 'libtool', 'pkg-config', 'git'])

  } else if (platform === 'linux') {
    const pm = detectPkgManager()

    if (pm !== undefined) {
      console.log(`Installing system dependencies w/ ${pm}...`)

      if (pm === 'apt-get') {
        exec(['apt-get', 'update'])
        exec(['apt-get', 'install', '-y', 'swig', 'autoconf', 'automake', 'libtool', 'pkg-config', 'git', 'build-essential'])

      } else if (pm === 'dnf') {
        exec(['dnf', 'update'])
        exec(['dnf', 'install', '-y', 'swig', 'autoconf', 'automake', 'libtool', 'pkg-config', 'git', 'gcc-c++', 'make'])

      } else {
        // should not be reached
      }
    } else {
      console.log('No supported package manager found')
    }
  } else {
    console.log(`Unsupported platform: ${platform}`)
  }
}

const getDepArchDir = (dependsDir) => {
  const arches = [
    'x86_64', 'i686', 'mips', 'arm', 'aarch64',
    'powerpc', 'riscv32', 'riscv64', 's390x'
  ]
  if (!fs.existsSync(dependsDir)) {
    throw new Error(`${dependsDir} not found`)
  }

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
    console.log(`Removed exisitng navio-core dir`)
  } else {
    console.log(`No existing navio-core dir found`)
  }

  const cmd = ['git', 'clone', '--depth', '1']
  if (cfg.navioCoreBranch !== "") {
    cmd.push('--branch', cfg.navioCoreBranch)
  }
  cmd.push(cfg.navioCoreRepo, 'navio-core')

  const res = spawnSync(cmd[0], cmd.slice(1))
  if (res.status !== 0) {
    throw new Error(`Failed to git clone navio-core ${JSON.stringify(res)}`)
  }
  console.log(`Cloned navio-core`)
}

const buildDepends = (cfg, numCpus) => {
  if (fs.existsSync(cfg.dependsBakDir)) {
    console.log('Copying the backup of dependency dir...')
    fs.cpSync(cfg.dependsBakDir, cfg.dependsDir, { recursive: true })
  } else {
    console.log('Building navio-core dependencies...')

    const res = spawnSync('make', ['-j', numCpus], { cwd: cfg.dependsDir })
    if (res.status !== 0) {
      throw new Error(`Failed to build dependencies: ${JSON.stringify(res)}`)
    }
    console.log('Creating backup of depends dir...')
    fs.cpSync(cfg.dependsDir, cfg.dependsBakDir, { recursive: true })
  }
  return getDepArchDir(cfg.dependsDir)
}

const buildLibBlsct = (cfg, numCpus, depArchDir) => {
  // run autogen.sh
  console.log('Running autogen.sh...')
  const autogenRes = spawnSync('./autogen.sh', [], { cwd: cfg.navioCoreDir })
  if (autogenRes.status !== 0) {
    throw new Error(`autogen.sh failed: ${JSON.stringify(autogenRes)}`)
  }

  // run configure
  console.log(`Running configure...`)
  const configureRes = spawnSync('./configure', [
    `--prefix=${depArchDir}`,
    '--enable-build-libblsct-only'
  ], {
    cwd: cfg.navioCoreDir,
  })
  if (configureRes.status !== 0) {
    throw new Error(`Running configure failed: ${JSON.stringify(configureRes)}`)
  }

  // build libblsct
  console.log('Building libblsct...')
  const makeRes = spawnSync('make', ['-j', numCpus], {
    cwd: cfg.navioCoreDir,
  })
  if (makeRes.status !== 0) {
    throw new Error(`Building libblsct failed: ${JSON.stringify(makeRes)}`)
  }

  // prepare a fresh lib dir
  if (fs.existsSync(cfg.libDir)) {
    fs.rmSync(cfg.libDir, { recursive: true, force: true })
  }
  fs.mkdirSync(cfg.libDir, { recursive: true })

  // copy .a files to the lib dir
  for (const libFile of cfg.libFiles) {
    const dest = path.join(cfg.libDir, path.basename(libFile))
    console.log(`Copying ${libFile} to ${dest}...`)
    fs.copyFileSync(libFile, dest)
  }
}

const buildSwigWrapper = (cfg) => {
  console.log('Building swig wrapper...')
  const res = spawnSync(
    'swig', ['-c++', '-javascript', '-node', 'blsct.i'],
    { cwd: cfg.swigDir }
  )
  if (res.status !== 0) {
    throw new Error(`Failed to build swig wrapper: ${JSON.stringify(res)}`)
  }
}

const main = () => {
  const cfg = getCfg(IS_PROD)
  const numCpus = os.cpus().length

  installSystemDeps()
  gitCloneNavioCore(cfg)
  depArchDir = buildDepends(cfg, numCpus)
  buildLibBlsct(cfg, numCpus, depArchDir)
  buildSwigWrapper(cfg)
}

main()
