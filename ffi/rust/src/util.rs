use crate::ffi::{
  BlsctRetVal,
  malloc,
};
use std::ffi::{
  c_char,
  CStr,
  CString,
};

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

pub fn pad_hex_left<T>(hex: *const c_char) -> CString {
  let mut h = unsafe {
    CStr::from_ptr(hex).to_bytes().to_vec()
  };
  let len = std::mem::size_of::<T>() * 2;

  if h.len() < len {
    let mut padded = Vec::with_capacity(len);
    padded.resize(len - h.len(), b'0'); // left pad
    padded.extend_from_slice(&h);
    h = padded;
  }
  CString::new(h).unwrap()
}
