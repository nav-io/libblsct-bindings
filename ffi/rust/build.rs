use std::env;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;
use num_cpus;

const IS_PROD: bool = true;

const NAVIO_REPO_URL_PROD: &str = "https://github.com/nav-io/navio-core";
const NAIVO_REPO_URL_DEV: &str = "https://github.com/gogoex/navio-core";
const NAVIO_REPO_PROD_SHA: &str = "edf9948e91c4b0d92a39b81c6de0b33ce8c9d149";
const NAVIO_REPO_DEV_BRANCH: &str = "";

fn copy_dir(src_dir: &Path, dest_dir: &Path) -> io::Result<()> {
  fs::create_dir_all(dest_dir)?;

  for f in fs::read_dir(src_dir)? {
    let f = f?;
    let f = f.path();
    let dest_path = dest_dir.join(&f.file_name().unwrap());

    if f.is_file() {
      fs::copy(&f, &dest_path)?;
    } else {
      copy_dir(&f, &dest_path)?
    }
  }
  Ok(())
}

fn get_navio_core_path() -> PathBuf {
  let manifest_dir = PathBuf::from(
    env::var("CARGO_MANIFEST_DIR")
      .expect("CARGO_MANIFEST_DIR not set")
  );
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
      .expect(format!("Failed to fetch commit {NAVIO_REPO_PROD_SHA}").as_str());

    let args = vec!["checkout", NAVIO_REPO_PROD_SHA];
    Command::new("git")
      .args(args)
      .current_dir(navio_core_path)
      .status()
      .expect(format!("Failed to checkout commit {NAVIO_REPO_PROD_SHA}").as_str());
  }
}

fn get_depends_arch_path(depends_path: &Path) -> io::Result<PathBuf> {
  if !depends_path.exists() {
    return Err(io::Error::new(
      io::ErrorKind::NotFound,
      format!("{} is missing", depends_path.display()),
    ));
  }
  let arches = [
    "x86_64", "i686", "mips", "arm", "aarch64",
    "powerpc", "riscv32", "riscv64", "s390x"
  ];
  for entry in fs::read_dir(depends_path)? {
    let entry = entry?;
    if entry.file_type()?.is_dir() {
      let name = entry.file_name();
      let name = name.to_string_lossy();
      if arches.iter().any(|arch| name.starts_with(arch)) {
        println!("Found dependency arch dir: {}", name);
        return Ok(entry.path());
      }
    }
  }
  Err(io::Error::new(
    io::ErrorKind::NotFound,
    format!(
      "Failed to find dependency arch dir in {}",
      depends_path.display()
    ),
  ))
}

fn build_depends(
  navio_core_path: &Path, 
  depends_path: &Path,
  num_cpus: &str,
) -> io::Result<PathBuf> {
  let depends_bak_path =
    navio_core_path
      .parent().unwrap()
      .parent().unwrap()
      .join("depends");

  if depends_bak_path.exists() {
    println!("Copying backup of depends under navio-core...");

    fs::remove_dir_all(&depends_path).unwrap();
    copy_dir(&depends_bak_path, &depends_path).unwrap();

  } else {
    // if there is no backup directory of depends dir,
    // build navio-core dependencies and create the backup
    println!("Buliding dependencies of navio-core...");
    Command::new("make")
      .args(["-j", num_cpus])
      .current_dir(depends_path)
      .status()
      .expect("Failed to clone navio-core repository");
  
    // create the backup
    println!("Creating backup of navio-core dependencies...");
    copy_dir(&depends_path, &depends_bak_path).unwrap();
  }

  get_depends_arch_path(depends_path)
}

fn build_libblsct(
  navio_core_path: &Path,
  depends_arch_path: &Path,
  dot_a_src_dest_paths: &Vec<(PathBuf, PathBuf)>,
  num_cpus: &str,
) {
  // build libblsct.a and its dependencies
  println!("Building libblsct.a and its dependencies...");

  Command::new("./autogen.sh")
    .current_dir(&navio_core_path)
    .status()
    .expect("Failed to run autogen.sh");

  Command::new("./configure")
    .args([
      &format!("--prefix={}", depends_arch_path.display()),
      "--enable-build-libblsct-only",
    ])
    .current_dir(&navio_core_path)
    .status()
    .expect("Failed to run configure");

  Command::new("make")
    .args(["-j", &num_cpus])
    .current_dir(&navio_core_path)
    .status()
    .expect("Failed to build libblsct");

  // copy libblsct.a and its dependencies to libs directory
  for (src, dest) in dot_a_src_dest_paths {
    println!("Copying {} to {}...", &src.display(), &dest.display());
    fs::copy(&src, &dest).unwrap();
  }
}

fn print_link_instructions(libs_path: &Path) {
  println!("cargo:rustc-link-lib=c++");

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

  vec![
    (src_path.join("libblsct.a"), libs_path.join("libblsct.a")),
    (src_path.join("libunivalue_blsct.a"), libs_path.join("libunivalue_blsct.a")),
    (mcl_lib_path.join("libmcl.a"), libs_path.join("libmcl.a")),
    (bls_lib_path.join("libbls384_256.a"), libs_path.join("libbls384_256.a")),
  ]
}

fn prepare_fresh_libs_dir(libs_path: &Path) {
  if libs_path.exists() {
    fs::remove_dir_all(&libs_path).unwrap();
  }
  fs::create_dir(&libs_path).unwrap();
}

fn main() {
  let navio_core_path = get_navio_core_path();
  let libs_path = navio_core_path
    .parent().unwrap()
    .parent().unwrap()
    .join("libs");

  let dot_a_src_dest_paths =
    get_lib_paths(&navio_core_path, &libs_path);

  // build libblsct.a and its dependency if not built yet
  if dot_a_src_dest_paths.iter().any(|(_, dest)| !dest.exists()) {
    prepare_fresh_libs_dir(&libs_path);

    let depends_path = navio_core_path.join("depends");
    let num_cpus = num_cpus::get().to_string();

    clone_navio_core(&navio_core_path);

    let depends_arch_path = build_depends(
      &navio_core_path,
      &depends_path,
      &num_cpus,
    ).unwrap();

    build_libblsct(
      &navio_core_path,
      &depends_arch_path,
      &dot_a_src_dest_paths,
      &num_cpus,
    );
  }

  print_link_instructions(&libs_path);
}

