use crate::keys::double_public_key::DoublePublicKey;
use crate::{
  blsct_obj::BlsctObj,
  ffi::{
    AddressEncoding,
    decode_address,
    encode_address,
    free_obj,
  },
};
use std::ffi::{
  c_char,
  c_void,
  {CStr, CString},
};

pub struct Address();

impl Address {
  pub fn encode(
    addr_dpk: &DoublePublicKey,
    encoding: AddressEncoding,
  ) -> Result<String, &'static str> {
    let rv = unsafe { encode_address(addr_dpk.value(), encoding) };
    if rv.is_null() {
      unsafe { free_obj(rv as *mut c_void) };
      Err("Failed to allocate memory to BlsctRetVal")

    } else if unsafe { (*rv).result != 0 } {
      unsafe { free_obj(rv as *mut c_void) };
      Err("Failed to encode address")

    } else {
      let addr_c_str = unsafe { CStr::from_ptr((*rv).value as *const c_char) };
      let addr = addr_c_str.to_str().unwrap().to_string();
      unsafe { free_obj((*rv).value as *mut c_void) };
      Ok(addr)
    }
  }

  pub fn decode(addr_str: &str) -> Result<DoublePublicKey, &'static str> {
    let c_addr_str = CString::new(addr_str).unwrap();
    let rv = unsafe { decode_address(c_addr_str.as_ptr()) };
    if rv.is_null() {
      unsafe { free_obj(rv as *mut c_void) };
      Err("Failed to allocate memory to BlsctRetVal")

    } else if unsafe { (*rv).result != 0 } {
      unsafe { free_obj(rv as *mut c_void) };
      Err("Failed to decode address")

    } else {
      let addr_dpk = BlsctObj::from_retval(rv)?;
      Ok(addr_dpk.into())
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    keys::double_public_key::DoublePublicKey,
  };

  #[test]
  fn test_encode_decode() {
    init();

    for encoding in [AddressEncoding::Bech32, AddressEncoding::Bech32M] {
      let addr_dpk = DoublePublicKey::random().unwrap();
      let addr_str = Address::encode(&addr_dpk, encoding).unwrap();
      println!("addr_str: {}", addr_str);

      let decoded_dpk = Address::decode(&addr_str).unwrap();
      assert_eq!(addr_dpk, decoded_dpk);
    }
  }
}

