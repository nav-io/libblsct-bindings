use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use num_cpus;

fn get_arch_path(depends_path: &PathBuf) -> Result<PathBuf,String> {
	let arches = vec!["x86_64", "i686", "mips", "arm", "aarch64", "powerpc", "riscv32", "riscv64", "s390x"];

  let entries = fs::read_dir(depends_path).map_err(|_| "Failed to read depends directory".to_string())?;

  for e in entries.flatten() {
    let f = e.file_name();
    let f = f.to_string_lossy();

    if arches.iter().any(|arch| f.starts_with(arch)) && e.path().is_dir() {
      return fs::canonicalize(
        e.path()).map_err(|_| "Failed to get absolute path".to_string());
    }
  }
  Err("Arch dependency directory missing".to_string())
}

fn main() {
  let cargo_target_dir: String =
    env::var("CARGO_TARGET_DIR")
      .unwrap_or_else(|_| "target".to_string());

  let target_path = PathBuf::from(&cargo_target_dir);
  let navio_core_path = &target_path.join("navio-core");
  if !navio_core_path.exists() {
    let repo_url = "https://github.com/nav-io/navio-core";
    Command::new("git")
      .args(["clone", "--depth", "1", repo_url, navio_core_path.to_str().unwrap()])
      .status()
      .expect("Failed to clone navio-core repository");
  }

  let src_path = navio_core_path.join("src");
  let bls_path = src_path.join("bls");
  let bls_lib_path = bls_path.join("lib");
  let mcl_path = bls_path.join("mcl");
  let mcl_lib_path = mcl_path.join("lib");

  let libblsct_a = src_path.join("libblsct.a");
  let libunivalue_blsct_a = src_path.join("libunivalue_blsct.a");
  let libmcl_a = mcl_lib_path.join("libmcl.a");
  let libbls384_256_a = bls_lib_path.join("libbls384_256.a");

  if !libblsct_a.exists() 
    || !libunivalue_blsct_a.exists()
    || !libmcl_a.exists()
    || !libbls384_256_a.exists() {

    // build dependencies
    Command::new("make")
      .arg("-j")
      .arg(num_cpus::get().to_string())
      .current_dir(navio_core_path.join("depends"))
      .status()
      .expect("Failed to build dependencies");

    let prefix_path = get_arch_path(&navio_core_path.join("depends")).unwrap();

    // build libblsct
    Command::new("./autogen.sh")
      .current_dir(&navio_core_path)
      .status()
      .expect("Failed to run autogen.sh");

    Command::new("./configure")
      .args([
        &format!("--prefix={}", prefix_path.to_str().unwrap()),
        "--enable-build-libblsct-only",
      ])
      .current_dir(&navio_core_path)
      .status()
      .expect("Failed to run configure");

    Command::new("make")
      .args(["-j", &num_cpus::get().to_string()])
      .current_dir(&navio_core_path)
      .status()
      .expect("Failed to build libblsct");
  }

  println!("cargo:rustc-link-lib=c++");

  // Library search paths
  println!("cargo:rustc-link-search=native={}", src_path.display());
  println!("cargo:rustc-link-search=native={}", bls_lib_path.display());
  println!("cargo:rustc-link-search=native={}", mcl_lib_path.display());

  // Libraries to link
  println!("cargo:rustc-link-lib=static=blsct");
  println!("cargo:rustc-link-lib=static=univalue_blsct");
  println!("cargo:rustc-link-lib=static=mcl");
  println!("cargo:rustc-link-lib=static=bls384_256");
}

