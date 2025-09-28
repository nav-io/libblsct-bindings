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

macro_rules! impl_clone {
  ($name:ident) => {
    impl Clone for $name {
      fn clone(&self) -> Self {
        let hex = bincode::serialize(self).unwrap();
        bincode::deserialize::<$name>(&hex).unwrap()
      }
    }
  }
}

macro_rules! impl_key {
  ($name:ident) => {
    use crate::{
      blsct_obj::BlsctObj,
      ffi::BlsctScalar,
      scalar::Scalar,
    };
    use serde::{Deserialize, Serialize};

    #[derive(PartialEq, Eq, Debug, Deserialize, Serialize)]
    pub struct $name(Scalar);

    impl $name {
      pub fn value(&self) -> *const BlsctScalar {
        self.0.value()
      }
    }

    impl From<BlsctObj<Scalar, BlsctScalar>> for $name {
      fn from(obj: BlsctObj<Scalar, BlsctScalar>) -> $name {
        $name(obj.into())
      }
    }

    impl Clone for $name {
      fn clone(&self) -> Self {
        let hex = bincode::serialize(self).unwrap();
        bincode::deserialize::<$name>(&hex).unwrap()
      }
    }
  };
}

pub(crate) use impl_clone;
pub(crate) use impl_display;
pub(crate) use impl_from_retval;
pub(crate) use impl_value;
pub(crate) use impl_key;
