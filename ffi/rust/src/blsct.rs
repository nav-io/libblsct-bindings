extern "C" {
  #[link_name = "init"]
  fn init_impl();
}

pub fn init() {
  unsafe { init_impl() }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_hello() {
    init();
  }
}

