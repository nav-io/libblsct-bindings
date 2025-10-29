use crate::keys::double_public_key::DoublePublicKey;
use crate::{
  blsct_obj::{BlsctObj, self},
  ffi::{
    AddressEncoding,
    decode_address,
    encode_address,
    free_obj,
  },
};
use std::{
  fmt,
  ffi::{
    c_char,
    c_void,
    CStr,
    CString,
    NulError,
  },
};

#[derive(Debug)]
pub enum Error<'a> {
  FailedToAllocateMemory(&'static str),
  FailedToConstructBlsctRetVal(blsct_obj::Error<'a>),
  FailedToEncodeAddress(&'a DoublePublicKey),
  FailedToDecodeAddress(&'a str),
  FailedToConstructCString(NulError),
}

impl<'a> std::error::Error for Error<'a> {}

impl<'a> fmt::Display for Error<'a> {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      Error::FailedToAllocateMemory(target) =>
        write!(f, "Failed to allocate memory for {target}"),
      Error::FailedToConstructBlsctRetVal(e) =>
        write!(f, "Failed to construct BlsctRetVal: {e:?}"),
      Error::FailedToEncodeAddress(dpk) =>
        write!(f, "Failed to encode address: {dpk:?}"),
      Error::FailedToDecodeAddress(addr_str) =>
        write!(f, "Failed to decode address: {addr_str}"),
      Error::FailedToConstructCString(e) =>
        write!(f, "Failed to construct CString: {e:?}"),
    }
  }
}

pub struct Address();

impl Address {
  pub fn encode(
    addr_dpk: &DoublePublicKey,
    encoding: AddressEncoding,
  ) -> Result<String, Error> {
    let rv = unsafe { encode_address(addr_dpk.value(), encoding) };
    if rv.is_null() {
      unsafe { free_obj(rv as *mut c_void) };
      Err(Error::FailedToAllocateMemory("BlsctRetVal"))

    } else if unsafe { (*rv).result != 0 } {
      unsafe { free_obj(rv as *mut c_void) };
      Err(Error::FailedToEncodeAddress(addr_dpk))

    } else {
      let addr_c_str = unsafe { CStr::from_ptr((*rv).value as *const c_char) };
      let addr = addr_c_str.to_str().unwrap().to_string();
      unsafe { free_obj((*rv).value as *mut c_void) };
      Ok(addr)
    }
  }

  pub fn decode(addr_str: &str) -> Result<DoublePublicKey, Error> {
    let c_addr_str = CString::new(addr_str)
      .map_err(|e| Error::FailedToConstructCString(e))?;

    let rv = unsafe { decode_address(c_addr_str.as_ptr()) };
    if rv.is_null() {
      unsafe { free_obj(rv as *mut c_void) };
      Err(Error::FailedToAllocateMemory("BlsctRetVal"))

    } else if unsafe { (*rv).result != 0 } {
      unsafe { free_obj(rv as *mut c_void) };
      Err(Error::FailedToDecodeAddress(addr_str))

    } else {
      let addr_dpk = BlsctObj::from_retval(rv)
        .map_err(|e| Error::FailedToConstructBlsctRetVal(e))?;
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

