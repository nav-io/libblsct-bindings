use std::ffi::c_void;
use crate::common::BlsctRetVal;

extern "C" {
  pub fn free_obj(x: *mut c_void);

  // Scalar
  pub fn gen_scalar(n: u64) -> *const BlsctRetVal;
  pub fn gen_random_scalar() -> *const BlsctRetVal;
  //pub fn scalar_to_uint64(blsct_scalar: *const BlsctScalar) -> u64;

  // Point
}

