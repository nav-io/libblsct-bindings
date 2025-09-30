use crate::{
  keys::{
    child_key::ChildKey,
    child_key_desc::tx_key_desc::view_key::ViewKey,
  },
  ffi::{
    BlsctRetVal,
    malloc,
  },
};
use rand::Rng;
use std::{
  ffi::{
    c_char,
    CStr,
    CString,
  },
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

  // allocate memory for BlsctRetVal
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
    padded.resize(len - h.len(), b'0');
    padded.extend_from_slice(&h);
    h = padded;
  }
  CString::new(h).unwrap()
}

pub fn gen_random_view_key() -> ViewKey {
  let child_key = ChildKey::random();
  child_key.to_tx_key().to_view_key() 
}

pub fn gen_random_malloced_buf<const N: usize>() -> *mut [u8; N] {
  let mut rng = rand::rng();
  let mut buf = [0u8; N];
  rng.fill(&mut buf[..]);

  let c_obj = unsafe { libc::malloc(N) as *mut [u8; N] };
  assert!(!c_obj.is_null(), "malloc failed");
  unsafe {
    std::ptr::copy_nonoverlapping(buf.as_ptr(), c_obj as *mut u8, N);
  }
  c_obj
}

