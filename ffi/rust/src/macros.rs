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

pub(crate) use impl_from_retval;
