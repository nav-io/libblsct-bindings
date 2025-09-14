use std::ffi::c_void;
use std::os::raw::{c_char, c_int};
use std::sync::Once;

#[repr(C)]
#[derive(Debug)]
pub struct BlsctRetVal {
  pub result: u8,
  pub value: *const c_void,
  pub value_size: usize,
}

// constsnts
pub const POINT_SIZE: usize = 48;
pub const PUBLIC_KEY_SIZE: usize = 48;
const SCALAR_SIZE: usize = 32;

// serialized types
pub type BlsctPoint = [u8; POINT_SIZE];
pub type BlsctPubKey = [u8; PUBLIC_KEY_SIZE];
pub type BlsctScalar = [u8; SCALAR_SIZE];

extern "C" {

pub fn malloc(size: usize) -> *mut core::ffi::c_void;

#[link_name = "init"]
pub fn init_impl();  // rename on the rust side to avoid name conflict

pub fn free_obj(x: *mut c_void);

// ChildKey
pub fn from_seed_to_child_key(seed: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_blinding_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_token_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_tx_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;

// Point
pub fn gen_base_point() -> *mut BlsctRetVal;
pub fn gen_random_point() -> *mut BlsctRetVal;
pub fn deserialize_point(hex: *const c_char) -> *mut BlsctRetVal;
pub fn is_point_equal(a: *const BlsctPoint, b: *const BlsctPoint) -> c_int;
pub fn is_valid_point(blsct_point: *const BlsctPoint) -> c_int;
pub fn point_from_scalar(scalar: *const BlsctScalar) -> *mut BlsctPoint;
pub fn serialize_point(blsct_point: *const BlsctPoint) -> *const c_char;

// PrivSpendingKey
pub fn calc_priv_spending_key(
  blsct_blinding_pub_key: *const BlsctPubKey,
  blsct_view_key: *const BlsctScalar,
  blsct_spending_key: *const BlsctScalar,
  account: i64,
  address: u64,
) -> *mut BlsctScalar;

// PublicKey
pub fn gen_random_public_key() -> *mut BlsctRetVal;
pub fn get_public_key_point(pub_key: *const BlsctPubKey) -> *mut BlsctPoint;
pub fn point_to_public_key(point: *const BlsctPoint) -> *mut BlsctPubKey;
pub fn scalar_to_pub_key(blsct_scalar: *const BlsctScalar) -> *mut BlsctPubKey;
pub fn calc_nonce(
  blinding_pub_key: *const BlsctPubKey,
  view_key: *const BlsctScalar, 
) -> *mut BlsctPoint;

// Scalar
pub fn deserialize_scalar(hex: *const c_char) -> *mut BlsctRetVal;
pub fn gen_scalar(n: u64) -> *mut BlsctRetVal;
pub fn gen_random_scalar() -> *mut BlsctRetVal;
pub fn is_scalar_equal(a: *const BlsctScalar, b: *const BlsctScalar) -> c_int;
pub fn scalar_to_uint64(blsct_scalar: *const BlsctScalar) -> u64;
pub fn serialize_scalar(blsct_scalar: *const BlsctScalar) -> *const c_char;

// TxKey
pub fn from_tx_key_to_view_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_tx_key_to_spending_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;

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

