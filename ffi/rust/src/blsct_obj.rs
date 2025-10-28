use std::slice;
use crate::{
  blsct_serde::BlsctSerde,
  ffi::{
    BlsctRetVal,
    free_obj,
  },
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
    CStr,
    CString,
  },
  fmt,
  ptr::NonNull,
};


#[derive(Eq, Debug)]
pub struct BlsctObj<T: BlsctSerde, U> {
  ptr: NonNull<u8>,
  size: usize,
  deallocator: Option<unsafe extern "C" fn(*mut c_void)>,
  _t: std::marker::PhantomData<*mut T>,
  _u: std::marker::PhantomData<fn() -> U>,
}

// assumes that `ptr` points to readble memory of `size` bytes
impl<T: BlsctSerde, U> PartialEq for BlsctObj<T, U> {
  fn eq(&self, other: &Self) -> bool {
    if self.size != other.size {
      return false;
    }
    unsafe {
      let a: &[u8] = slice::from_raw_parts(self.ptr.as_ptr(), self.size);
      let b: &[u8] = slice::from_raw_parts(other.ptr.as_ptr(), other.size);
      a == b
    }
  }
}

impl<T: BlsctSerde, U> fmt::Display for BlsctObj<T, U> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let bytes = bincode::serialize(self).map_err(|_| fmt::Error)?;
    let hex = hex::encode(bytes);
    write!(f, "{}", hex)
  }
}

impl<T: BlsctSerde, U> BlsctObj<T, U> {
  pub fn new_with_deallocator(
    ptr: NonNull<u8>,
    size: usize,
    deallocator: Option<unsafe extern "C" fn(*mut c_void)>,
  ) -> Self {
    Self {
      ptr,
      size,
      deallocator,
      _t: std::marker::PhantomData,
      _u: std::marker::PhantomData,
    }
  }

  pub fn new(
    ptr: NonNull<u8>,
    size: usize,
  ) -> Self {
    Self {
      ptr,
      size,
      deallocator: None,
      _t: std::marker::PhantomData,
      _u: std::marker::PhantomData,
    }
  }

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
      println!("result code: {}", result);
      return Err("Failed to generate object");
    }
    assert!(!value.is_null(),
      "the value is null altough result is 0. check code.");

    let ptr = NonNull::new(value as *mut u8).unwrap();

    Ok(Self {
      ptr,
      size: value_size,
      _t: std::marker::PhantomData,
      _u: std::marker::PhantomData,
      deallocator: None,
    })
  }

  pub fn from_c_obj(c_obj: *mut U) -> Self {
    let ptr = NonNull::new(c_obj as *mut u8).unwrap();
    let size = std::mem::size_of::<U>();
    Self {
      ptr,
      size,
      _t: std::marker::PhantomData,
      _u: std::marker::PhantomData,
      deallocator: None,
    }
  }

  pub fn from_c_obj_and_size(
    c_obj: *mut c_void,
    size: usize,
  ) -> Self {
    let ptr = NonNull::new(c_obj as *mut u8).unwrap();
    Self {
      ptr,
      size,
      _t: std::marker::PhantomData,
      _u: std::marker::PhantomData,
      deallocator: None,
    }
  }

  #[inline] pub fn size(&self) -> usize { self.size }

  #[inline] pub fn as_ptr(&self) -> *const U {
    self.ptr.as_ptr() as *const U
  }
}

// expects T::serialize to take a pointer to a BLSCT object
// and return a pointer to a c-string (null-terminated byte sequence)
impl<T: BlsctSerde, U> Serialize for BlsctObj<T, U> {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: Serializer {
    let c_hex = unsafe { T::serialize(self.as_ptr() as *const u8, self.size()) };
    if c_hex.is_null() {
      return Err(SerError::custom("Serialization failed. c_hex is null"));
    }
    let hex = unsafe { CStr::from_ptr(c_hex) }
      .to_str()
      .map_err(|e| SerError::custom(format!("Converting C-Str to String failed: {:?}", e)))?
      .to_owned();

    unsafe { free_obj(c_hex as *mut c_void); }

    serializer.serialize_str(&hex)
  }
}

// expects T::deserialize to take a pointer to a c-string
// and return a pointer to a BlsctRetVal
impl<'de, T: BlsctSerde, U> Deserialize<'de> for BlsctObj<T, U> {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where D: Deserializer<'de> {
    let hex: String = Deserialize::deserialize(deserializer)?;
    let hex_c_str = CString::new(hex)
      .map_err(|_| DeError::custom("string contains interior NUL"))?;

    let rv = unsafe { T::deserialize(hex_c_str.as_ptr()) };

    Ok(BlsctObj::<T, U>::from_retval(rv)
      .map_err(|e| DeError::custom(format!("Deserialization failed: {:?}", e)))?)
  }
}

impl<T: BlsctSerde, U> Drop for BlsctObj<T, U> {
  fn drop(&mut self) {
    match self.deallocator {
      Some(f) => unsafe { 
        f(self.ptr.as_ptr().cast::<c_void>())
      },
      None => unsafe { free_obj(self.ptr.as_ptr() as *mut c_void); },
    }
  }
}

