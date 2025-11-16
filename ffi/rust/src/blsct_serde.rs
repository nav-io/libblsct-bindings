use crate::ffi::BlsctRetVal;
use std::os::raw::c_char;

pub trait BlsctSerde {
  unsafe fn serialize(ptr: *const u8, size: usize) -> *const c_char;
  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal;
}
