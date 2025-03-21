use std::{
  ffi::c_void,
  sync::Once,
};

extern "C" {
  #[link_name = "init"]
  fn init_impl();
}

#[repr(C)]
#[derive(Debug)]
pub struct BlsctRetVal {
  pub result: u8,
  pub value: *const c_void,
  pub value_size: usize,
}

static INIT: Once = Once::new();

pub fn init() {
  INIT.call_once(|| unsafe {
    init_impl();
  });
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_hello() {
    init();
  }
}

