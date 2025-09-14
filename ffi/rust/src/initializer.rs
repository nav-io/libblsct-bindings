use std::sync::Once;

extern "C" {

#[link_name = "init"]
pub fn init_impl();  // rename on the rust side to avoid name conflict

}

// init only once during the program lifetime
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
  fn test_init() {
    init();
  }
}

