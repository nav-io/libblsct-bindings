macro_rules! impl_display {
  ($type:ident) => {
    impl std::fmt::Display for $type {
      fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}({})", stringify!($type), self.obj)
      }
    }
  };
}

macro_rules! impl_from_retval {
  ($type:ident) => {
    impl $type {
      #[inline]
      pub fn from_retval(rv: *mut BlsctRetVal) -> Result<Self, &'static str> {
        let obj = BlsctObj::from_retval(rv)?;
        let inst = Self { obj };
        Ok(inst)
      }
    }
  };
}

macro_rules! impl_value {
  ($t:ident, $u:ident) => {
    pub fn value(&self) -> *const $u {
      self.obj.as_ptr()
    }
  };
}

pub(crate) use impl_display;
pub(crate) use impl_from_retval;
pub(crate) use impl_value;
