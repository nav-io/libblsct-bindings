use crate::ffi::{
  BlsctRetVal,
  malloc,
};
use std::ffi::c_char;

pub fn c_hex_str_to_array<const N: usize>(
  raw_hex_c_str: *const c_char
) -> [u8; N] {

  let hex_c_str = unsafe {
    std::ffi::CStr::from_ptr(raw_hex_c_str)
  };
  let hex_str = hex_c_str.to_str().unwrap();

  let bytes = hex::decode(hex_str).unwrap();
  bytes
    .as_slice()
    .try_into()
    .expect("Hex length doesn't match the expected Blsct object size")
}

pub fn build_succ_blsct_ret_val<const N: usize>(
  value: *const u8
) -> Result<*mut BlsctRetVal, &'static str> {

  // allocate memory for BlsctPubKey
  let rv_ptr = unsafe {
    malloc(std::mem::size_of::<BlsctRetVal>()) as *mut BlsctRetVal
  };
  if rv_ptr.is_null() {
    return Err("Failed to allocate memory for BlsctRetVal");
  }

  // copy local BlsctRetVal to the allocated memory
  unsafe {
    *rv_ptr = BlsctRetVal {
      result: 0,
      value: value as *const std::ffi::c_void,
      value_size: N,
    };
  }
  Ok(rv_ptr)
}
