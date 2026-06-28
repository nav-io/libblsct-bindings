use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const IS_PROD: bool = true;

const NAVIO_REPO_URL_PROD: &str = "https://github.com/nav-io/navio-core";
const NAIVO_REPO_URL_DEV: &str = "https://github.com/gogoex/navio-core";
const NAVIO_REPO_PROD_SHA: &str = "459f3e8e9bc216ac82f2c472a84cc7540fa97f0b"; // tag v0.1.0
const NAVIO_REPO_DEV_BRANCH: &str = "";

fn get_navio_core_path() -> PathBuf {
  let manifest_dir =
    PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR not set"));
  manifest_dir.join("target").join("navio-core")
}

fn clone_navio_core(navio_core_path: &Path) {
  // delete navio-core dir if already exists
  if navio_core_path.exists() {
    println!("Removing existing navio-core dir...");
    if let Err(e) = fs::remove_dir_all(navio_core_path) {
      eprintln!("Failed to remove existing navio-core dir: {}", e);
    }
  }

  // construct git clone command
  let (repo_url, branch) = match IS_PROD {
    true => (NAVIO_REPO_URL_PROD, None),
    false => (NAIVO_REPO_URL_DEV, Some(NAVIO_REPO_DEV_BRANCH)),
  };
  let mut args = vec!["clone", "--depth", "1"];
  if let Some(branch) = branch {
    args.push("--branch");
    args.push(branch)
  }
  println!("{:?}", args);
  //panic!("build script failed4 {:?}", args);
  args.push(repo_url);
  args.push(navio_core_path.file_name().unwrap().to_str().unwrap());

  // git clone the repository
  println!("Cloning {:?}", args);
  Command::new("git")
    .args(args)
    .current_dir(navio_core_path.parent().unwrap())
    .status()
    .expect("Failed to clone navio-core repository");

  if IS_PROD {
    let args = vec!["fetch", "--depth", "1", "origin", NAVIO_REPO_PROD_SHA];
    Command::new("git")
      .args(args)
      .current_dir(navio_core_path)
      .status()
      .unwrap_or_else(|_| panic!("Failed to fetch commit {NAVIO_REPO_PROD_SHA}"));

    let args = vec!["checkout", NAVIO_REPO_PROD_SHA];
    Command::new("git")
      .args(args)
      .current_dir(navio_core_path)
      .status()
      .unwrap_or_else(|_| panic!("Failed to checkout commit {NAVIO_REPO_PROD_SHA}"));
  }
}

fn build_libblsct(
  navio_core_path: &Path,
  cmake_build_path: &Path,
  dot_a_src_dest_paths: &Vec<(PathBuf, PathBuf)>,
  num_cpus: &str,
) {
  // navio-core v0.1.0+ builds with CMake. BUILD_LIBBLSCT_ONLY builds the
  // standalone libblsct.a and disables all node/wallet/daemon targets, so no
  // autotools `depends` prefix is required — mcl, bls, univalue and secp256k1
  // are vendored in-tree.
  println!("Building libblsct.a and its dependencies...");

  if cmake_build_path.exists() {
    fs::remove_dir_all(cmake_build_path).unwrap();
  }

  println!("Configuring navio-core (CMake, BUILD_LIBBLSCT_ONLY)...");
  Command::new("cmake")
    .args([
      "-S",
      &navio_core_path.display().to_string(),
      "-B",
      &cmake_build_path.display().to_string(),
      "-DBUILD_LIBBLSCT_ONLY=ON",
      "-DCMAKE_BUILD_TYPE=Release",
      "-DBUILD_TESTS=OFF",
      "-DBUILD_BENCH=OFF",
      "-DCMAKE_POSITION_INDEPENDENT_CODE=ON",
    ])
    .current_dir(navio_core_path)
    .status()
    .expect("Failed to run cmake configure");

  println!("Building libblsct...");
  Command::new("cmake")
    .args([
      "--build",
      &cmake_build_path.display().to_string(),
      "--target",
      "blsct",
      "univalue",
      "-j",
      num_cpus,
    ])
    .current_dir(navio_core_path)
    .status()
    .expect("Failed to build libblsct");

  // copy libblsct.a and its dependencies to libs directory
  for (src, dest) in dot_a_src_dest_paths {
    println!("Copying {} to {}...", &src.display(), &dest.display());
    fs::copy(src, dest).unwrap();
  }
}

fn print_link_instructions(libs_path: &Path) {
  if cfg!(target_os = "macos") {
    println!("cargo:rustc-link-lib=c++");
  } else {
    println!("cargo:rustc-link-lib=stdc++");
  }

  // library search path
  println!("cargo:rustc-link-search=native={}", libs_path.display());

  // libraries to link
  println!("cargo:rustc-link-lib=static=blsct");
  println!("cargo:rustc-link-lib=static=univalue_blsct");
  println!("cargo:rustc-link-lib=static=mcl");
  println!("cargo:rustc-link-lib=static=bls384_256");
}

fn get_lib_paths(navio_core_path: &Path, libs_path: &Path) -> Vec<(PathBuf, PathBuf)> {
  let src_path = navio_core_path.join("src");
  let bls_path = src_path.join("bls");
  let bls_lib_path = bls_path.join("lib");
  let mcl_path = bls_path.join("mcl");
  let mcl_lib_path = mcl_path.join("lib");

  // Static archives produced by the CMake BUILD_LIBBLSCT_ONLY build.
  // libblsct.a / libunivalue.a land in the out-of-source build tree; bls and
  // mcl are built in-source under src/bls (same paths as the old autotools build).
  let cmake_build_path = navio_core_path.join("build");

  vec![
    (
      cmake_build_path.join("lib").join("libblsct.a"),
      libs_path.join("libblsct.a"),
    ),
    (
      cmake_build_path
        .join("src")
        .join("univalue")
        .join("libunivalue.a"),
      libs_path.join("libunivalue_blsct.a"),
    ),
    (mcl_lib_path.join("libmcl.a"), libs_path.join("libmcl.a")),
    (
      bls_lib_path.join("libbls384_256.a"),
      libs_path.join("libbls384_256.a"),
    ),
  ]
}

fn prepare_fresh_libs_dir(libs_path: &Path) {
  if libs_path.exists() {
    fs::remove_dir_all(libs_path).unwrap();
  }
  fs::create_dir(libs_path).unwrap();
}

fn main() {
  let navio_core_path = get_navio_core_path();
  let libs_path = navio_core_path
    .parent()
    .unwrap()
    .parent()
    .unwrap()
    .join("libs");

  let dot_a_src_dest_paths = get_lib_paths(&navio_core_path, &libs_path);

  // build libblsct.a and its dependency if not built yet
  if dot_a_src_dest_paths.iter().any(|(_, dest)| !dest.exists()) {
    prepare_fresh_libs_dir(&libs_path);

    let cmake_build_path = navio_core_path.join("build");
    let num_cpus = num_cpus::get().to_string();

    clone_navio_core(&navio_core_path);

    build_libblsct(
      &navio_core_path,
      &cmake_build_path,
      &dot_a_src_dest_paths,
      &num_cpus,
    );
  }

  print_link_instructions(&libs_path);
}
