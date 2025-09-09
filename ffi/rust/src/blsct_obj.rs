use crate::blsct_serde::BlsctSerde;
use crate::ffi::{
  BlsctRetVal,
  free_obj,
};
use serde::{
  de::Error as DeError,
  ser::Error as SerError,
  Deserialize,
  Deserializer,
  Serialize,
  Serializer,
};
use std::{
  ffi::{
    c_void,
    {CStr, CString},
  },
  fmt,
};
use std::ptr::NonNull;

#[derive(Debug)]
pub struct BlsctObj<T: BlsctSerde> {
  ptr: NonNull<u8>,
  _size: usize,
  _x: std::marker::PhantomData<*mut T>
}

impl<T: BlsctSerde> fmt::Display for BlsctObj<T> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let bytes = bincode::serialize(self).map_err(|_| fmt::Error)?;
    let hex = hex::encode(bytes);
    write!(f, "{}", hex)
  }
}

impl<T: BlsctSerde> BlsctObj<T> {
  pub fn from_retval(rv: *mut BlsctRetVal) -> Result<Self, &'static str> {
    // check if allocating memory for BlsctRetVal is failed
    if rv.is_null() {
      return Err("Failed to allocate memory to the object");
    }
    let (result, value, value_size) = unsafe {
      ((*rv).result, (*rv).value, (*rv).value_size)
    };
    // BlscRetVal is no longer needed
    unsafe { free_obj(rv as *mut c_void); }

    // check if generating object is failed
    if result != 0 {
      return Err("Failed to generate object");
    }
    assert!(!value.is_null(),
      "the value is null altough result is 0. check code.");

    let ptr = NonNull::new(value as *mut u8).unwrap();

    Ok(Self {
      ptr,
      _size: value_size,
      _x: std::marker::PhantomData,
    })
  }

  //#[inline] pub fn len(&self) -> usize { self.size }

  #[inline] pub fn as_ptr(&self) -> *const u8 {
    self.ptr.as_ptr() as *const u8
  }
}

impl<T: BlsctSerde> Serialize for BlsctObj<T> {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: Serializer {
    let c_hex = unsafe { T::serialize(self.as_ptr()) };
    let hex = unsafe { CStr::from_ptr(c_hex) }
      .to_str()
      .map_err(|e| SerError::custom(format!("Converting C-Str to String failed: {:?}", e)))?
      .to_owned();

    unsafe { free_obj(c_hex as *mut c_void); }

    serializer.serialize_str(&hex)
  }
}

impl<'de, T: BlsctSerde> Deserialize<'de> for BlsctObj<T> {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where D: Deserializer<'de> {
    let hex: String = Deserialize::deserialize(deserializer)?;
    let c_hex = CString::new(hex).unwrap();
    let rv = unsafe { T::deserialize(c_hex.as_ptr()) };

    Ok(BlsctObj::<T>::from_retval(rv)
      .map_err(|e| DeError::custom(format!("Deserialization failed: {:?}", e)))?)
  }
}

impl<T: BlsctSerde> Drop for BlsctObj<T> {
  fn drop(&mut self) {
    unsafe {
      free_obj(self.ptr.as_ptr() as *mut c_void);
    }
  }
}

