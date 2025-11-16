import itertools
import multiprocessing
import os
import sys
from pathlib import Path
from setuptools import setup, Extension, find_packages
from distutils.command.build import build as build_org
from setuptools.command.build_ext import build_ext
import shutil
import subprocess

# TODO: turn this on for production builds
IS_PROD = True

std_cpp = "-std=c++20"

package_dir = Path(os.path.abspath(os.path.dirname(__file__)))

if IS_PROD:
  navio_core_repo = "https://github.com/nav-io/navio-core"
else:
  navio_core_repo = "https://github.com/gogoex/navio-core"
  navio_core_branch = ""

navio_core_dir = package_dir / "navio-core"
depends_dir = navio_core_dir / "depends"
navio_tmp_dir = Path.home() / ".navio-tmp"
depends_bak_dir = navio_tmp_dir / "depends"

src_path = navio_core_dir / "src"
bls_path = src_path / "bls"
bls_lib_path = bls_path / "lib"
mcl_path = bls_path / "mcl"
mcl_lib_path = mcl_path / "lib"

src_libblsct_a = src_path / "libblsct.a"
src_libunivalue_blsct_a = src_path / "libunivalue_blsct.a"
src_libmcl_a = mcl_lib_path / "libmcl.a"
src_libbls384_256_a = bls_lib_path / "libbls384_256.a"

src_dot_a_files = [src_libblsct_a, src_libunivalue_blsct_a, src_libmcl_a, src_libbls384_256_a]

libs_dir = navio_tmp_dir / "libs"

dest_libblsct_a = libs_dir / "libblsct.a"
dest_libunivalue_blsct_a = libs_dir / "libunivalue_blsct.a"
dest_libmcl_a = libs_dir / "libmcl.a"
dest_libbls384_256_a = libs_dir / "libbls384_256.a"

dest_dot_a_files = [dest_libblsct_a, dest_libunivalue_blsct_a, dest_libmcl_a, dest_libbls384_256_a]

def log(s):
  print(f"=========> {s}")

class CustomBuildExt(build_ext):
  def get_arch_path(self, depends_dir: Path) -> Path:
    arches = ["x86_64", "i686", "mips", "arm", "aarch64",
              "powerpc", "riscv32", "riscv64", "s390x"]
    if not depends_dir.is_dir():
      raise FileNotFoundError("Failed to read depends directory")

    for entry in depends_dir.iterdir():
      if any(entry.name.startswith(arch) for arch in arches) and entry.is_dir():
        return entry.resolve()

    raise FileNotFoundError("Arch dependency directory missing")

  def clone_navio_core(self):
    if os.path.isdir(navio_core_dir):
      shutil.rmtree(navio_core_dir)

    cmd = ["git", "clone", "--depth", "1"]
    if not IS_PROD:
      cmd += ["--branch", navio_core_branch]
    cmd += [navio_core_repo, navio_core_dir]

    subprocess.run(cmd, check=True)

  def build_libblsct(self, num_cpus: str):
    # if there is a backup of depends directory, use it
    if os.path.isdir(depends_bak_dir):
      log("Using backup of dependency directory...")
      shutil.rmtree(depends_dir)
      shutil.copytree(depends_bak_dir, depends_dir)
    else:
      log("Building dependendencies...")
      # otherwise, build the dependencies
      subprocess.run(
        ["make", "-j", num_cpus],
        cwd=depends_dir,
        check=True,
      )
      shutil.copytree(depends_dir, depends_bak_dir)
      log("Created backup of dependency directory")

    # Run autogen, configure, and make
    subprocess.run(["./autogen.sh"], cwd=navio_core_dir, check=True)
    arch_path = self.get_arch_path(depends_dir)

    subprocess.run(
      ["./configure", f"--prefix={arch_path}", "--enable-build-libblsct-only"],
      cwd=navio_core_dir,
      check=True,
    )
    subprocess.run(["make", "-j", num_cpus], cwd=navio_core_dir, check=True)

    os.makedirs(libs_dir, exist_ok=True)
    for (src, dest) in zip(src_dot_a_files, dest_dot_a_files):
      if os.path.exists(src):
        shutil.copy2(src, dest)
        log(f"Copyied {src} to {dest}")

  def run(self):
    # only blsct.h is needed actually, but clone the entire tree
    # for the sake of simplicity
    self.clone_navio_core()

    # copy existing .a files to appropriate locations if available 
    if all(os.path.exists(f) for f in dest_dot_a_files):
      log("Copying existing .a files to navio-core source tree...")
      for (src, dest) in zip(src_dot_a_files, dest_dot_a_files):
        shutil.copy2(dest, src)
        log(f"Copyied {dest} to {src}")
    else:
      # build .a files
      log("Building .a files...")
      num_cpus = str(multiprocessing.cpu_count())
      self.build_libblsct(num_cpus)

    super().run()

def print_directory_structure(start_path, level=0):
  if level == 0:
    print("----")
  exclude_dirs = ["venv", "__pycache__", "build", "dist", "navio-core", "swig"]
  prefix = " " * (level * 2)
  for item in os.listdir(start_path):
    item_path = os.path.join(start_path, item)
    if os.path.isdir(item_path):
      if item in exclude_dirs:
        print(f"{prefix}📂 {item}/")
        continue
      print(f"{prefix}📂 {item}/")
      print_directory_structure(item_path, level + 1)
    else:
      print(f"{prefix}📄 {item}")

class build(build_org):
  @staticmethod
  def partition(pred, iterable):
    a, b = itertools.tee(iterable)
    return itertools.filterfalse(pred, a), filter(pred, b)

  def finalize_options(self):
    super().finalize_options()
    pred = lambda el: el[0] == 'build_ext'
    rest, sub_build_ext = self.partition(pred, self.sub_commands)
    self.sub_commands[:] = list(sub_build_ext) + list(rest)

python_include_dirs = [
    path[2:] for path in subprocess.check_output(["python3-config", "--includes"])
    .decode()
    .strip()
    .split()
    if path.startswith("-I")
]

extra_link_args = [std_cpp]
extra_link_args = (
    extra_link_args + ["-undefined", "dynamic_lookup"]
    if sys.platform == "darwin"
    else extra_link_args
)

swig_module = Extension(
  "blsct._blsct",
  sources=[
    "blsct/blsct.i",
  ],
  include_dirs=[
    *python_include_dirs,
    os.path.join(navio_core_dir, "src"),
    os.path.join(navio_core_dir, "src/bls/include"),
    os.path.join(navio_core_dir, "src/bls/mcl/include"),
  ],
  library_dirs=[str(libs_dir)],
  libraries=["blsct", "univalue_blsct", "mcl", "bls384_256"],
  extra_compile_args=[
    std_cpp,
  ],
  extra_objects=[str(p) for p in dest_dot_a_files],
  extra_link_args=extra_link_args,
  swig_opts=[
    "-c++",
  ],
)

setup(
  py_modules=["blsct"],
  ext_modules=[swig_module],
  cmdclass={
    "build": build,
    "build_ext": CustomBuildExt,
  },
  packages=find_packages(),
)

#print_directory_structure(".")

