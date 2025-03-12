#![allow(non_snake_case)]

pub mod blsct;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_hello() {
    blsct::init();
  }
}

