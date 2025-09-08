use std::ffi::c_void;
use std::os::raw::{c_char, c_int};
use std::sync::Once;

#[repr(C)]
#[derive(Debug)]
pub struct BlsctRetVal {
  pub result: u8,
  pub value: *const c_void,
  pub value_size: usize,
}

// constsnts
const SCALAR_SIZE: usize = 32;

// serialized types
pub type BlsctScalar = [u8; SCALAR_SIZE];

extern "C" {

#[link_name = "init"]
pub fn init_impl();  // rename on the rust side to avoid name conflict

pub fn free_obj(x: *mut c_void);

// Scalar
pub fn gen_scalar(n: u64) -> *mut BlsctRetVal;
pub fn gen_random_scalar() -> *mut BlsctRetVal;
pub fn scalar_to_uint64(blsct_scalar: *const BlsctScalar) -> u64;
pub fn is_scalar_equal(a: *const BlsctScalar, b: *const BlsctScalar) -> c_int;
pub fn deserialize_scalar(hex: *const c_char) -> *mut BlsctRetVal;
pub fn serialize_scalar(blsct_scalar: *const BlsctScalar) -> *const c_char;

// Point

}

// init only once during the program lifetime
static INIT: Once = Once::new();
pub fn init() {
  INIT.call_once(|| unsafe {
    init_impl();
  });
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_init() {
    init();
  }
}

