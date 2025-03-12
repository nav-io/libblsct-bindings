extern "C" {
  #[link_name = "init"]
  fn init_impl();
}

pub fn init() {
  unsafe { init_impl() }
}

