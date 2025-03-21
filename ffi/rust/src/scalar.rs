use std::ffi::c_void;
use crate::common::BlsctRetVal;

const SCALAR_SIZE: usize = 32;

pub type BlsctScalar = [u8; SCALAR_SIZE];

pub struct Scalar {
  value: *const c_void,
}

impl Scalar {
  pub fn new(n: u64) -> Scalar {
    let ret = unsafe { &*gen_scalar(n) };

    Scalar {
      value: ret.value,
    }
  }

  pub fn random() -> Scalar {
    let ret = unsafe { &*gen_random_scalar() };

    Scalar {
      value: ret.value,
    }
  }
}

impl From<Scalar> for u64 {
  fn from(scalar: Scalar) -> u64 {
    let blsct_scalar = unsafe {
      &*(scalar.value as *const BlsctScalar)
    };
    unsafe { scalar_to_uint64(blsct_scalar) }
  }
}

impl Drop for Scalar {
  fn drop(&mut self) {
    unsafe {
      free_obj(self.value as *mut c_void);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::blsct::init;

  #[test]
  fn test_gen_scalar() {
    init();
    init();

    let n1 = Scalar::new(123);
    println!("n1: {}", u64::from(n1));

    let n2 = Scalar::random(); 
    println!("n2: {}", u64::from(n2));
  }
}

