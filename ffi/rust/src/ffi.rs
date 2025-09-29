use std::ffi::c_void;
use std::os::raw::{c_char, c_int};

#[repr(C)]
#[derive(Debug)]
pub struct BlsctRetVal {
  pub result: u8,
  pub value: *const c_void,
  pub value_size: usize,
}

#[repr(C)]
#[derive(Debug)]
pub enum AddressEncoding {
  Bech32,
  Bech32M,
}

// constants
pub const CTX_ID_SIZE: usize = 32;
pub const KEY_ID_SIZE: usize = 20;
pub const POINT_SIZE: usize = 48;
pub const PUBLIC_KEY_SIZE: usize = 48;
pub const DOUBLE_PUBLIC_KEY_SIZE: usize = PUBLIC_KEY_SIZE * 2;
const OUT_POINT_SIZE: usize = 36;
const SUB_ADDR_SIZE: usize = DOUBLE_PUBLIC_KEY_SIZE;
const SCALAR_SIZE: usize = 32;
pub const SCRIPT_SIZE: usize = 28;
pub const SIGNATURE_SIZE: usize = 96;
const SUB_ADDR_ID_SIZE: usize = 16;
pub const TOKEN_ID_SIZE: usize = 40;

// serialized types
pub type BlsctCTxId = [u8; CTX_ID_SIZE];
pub type BlsctDoublePubKey = [u8; DOUBLE_PUBLIC_KEY_SIZE];
pub type BlsctKeyId = [u8; KEY_ID_SIZE];  // = used for HashId
pub type BlsctOutPoint = [u8; OUT_POINT_SIZE];
pub type BlsctPoint = [u8; POINT_SIZE];
pub type BlsctPubKey = [u8; PUBLIC_KEY_SIZE];
pub type BlsctScalar = [u8; SCALAR_SIZE];
pub type BlsctScript = [u8; SCRIPT_SIZE];
pub type BlsctSignature = [u8; SIGNATURE_SIZE];
pub type BlsctSubAddr = [u8; SUB_ADDR_SIZE];
pub type BlsctSubAddrId = [u8; SUB_ADDR_ID_SIZE];
pub type BlsctTokenId = [u8; TOKEN_ID_SIZE];

extern "C" {

pub fn malloc(size: usize) -> *mut core::ffi::c_void;
pub fn free_obj(x: *mut c_void);

// Address
pub fn decode_address(blsct_enc_addr: *const c_char) -> *mut BlsctRetVal;
pub fn encode_address(
  blsct_dpk: *const BlsctDoublePubKey,
  addr_encoding: AddressEncoding,
) -> *mut BlsctRetVal;

// ChildKey
pub fn from_seed_to_child_key(seed: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_blinding_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_token_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_child_key_to_tx_key(child_key: *const BlsctScalar) -> *mut BlsctScalar;

// CTxId
pub fn serialize_ctx_id(blsct_ctx_id: *const BlsctCTxId) -> *const c_char;
pub fn deserialize_ctx_id(hex: *const c_char) -> *mut BlsctRetVal;

// DoublePublicKey
pub fn deserialize_dpk(hex: *const c_char) -> *mut BlsctRetVal;
pub fn gen_double_pub_key(
  blsct_pk1: *const BlsctPubKey,
  blsct_pk2: *const BlsctPubKey,
) -> *mut BlsctRetVal;
pub fn serialize_dpk(blsct_dpk: *const BlsctDoublePubKey) -> *const c_char;
pub fn gen_dpk_with_keys_acct_addr(
  blsct_view_key: *const BlsctScalar,
  blsct_spending_pub_key: *const BlsctPubKey,
  account: i64,
  address: u64,
) -> *mut BlsctDoublePubKey;
pub fn dpk_to_sub_addr(blsct_dpk: *const BlsctDoublePubKey) -> *mut BlsctRetVal;

// HashId
pub fn calc_key_id(
  blsct_blinding_pub_key: *const BlsctPubKey,
  blsct_spending_pub_key: *const BlsctPubKey,
  blsct_view_key: *const BlsctScalar,
) -> *mut BlsctKeyId;
pub fn serialize_key_id(blsct_key_id: *const BlsctKeyId) -> *const c_char;
pub fn deserialize_key_id(hex: *const c_char) -> *mut BlsctRetVal;

// OutPoint
pub fn gen_out_point(ctx_id_c_str: *const c_char, n: u32) -> *mut BlsctRetVal;
pub fn get_out_point_n(blsct_out_point: *const BlsctOutPoint) -> u32;
pub fn serialize_out_point(blsct_out_point: *const BlsctOutPoint) -> *const c_char;
pub fn deserialize_out_point(hex: *const c_char) -> *mut BlsctRetVal;

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

// Script
pub fn serialize_script(blsct_script: *const BlsctScript) -> *const c_char;
pub fn deserialize_script(hex: *const c_char) -> *mut BlsctRetVal;

// Signature
pub fn serialize_signature(blsct_signature: *const BlsctSignature) -> *const c_char;
pub fn deserialize_signature(hex: *const c_char) -> *mut BlsctRetVal;

// SubAddr
pub fn derive_sub_address(
    blsct_view_key: *const BlsctScalar,
    blsct_spending_pub_key: *const BlsctPubKey,
    blsct_sub_addr_id: *const BlsctSubAddrId,
) -> *mut BlsctSubAddr;
pub fn serialize_sub_addr(blsct_sub_addr: *const BlsctSignature) -> *const c_char;
pub fn deserialize_sub_addr(hex: *const c_char) -> *mut BlsctRetVal;

// SubAddrId
pub fn gen_sub_addr_id(account: i64, address: u64) -> *mut BlsctSubAddrId;
pub fn serialize_sub_addr_id(blsct_sub_addr_id: *const BlsctSubAddrId) -> *const c_char;
pub fn deserialize_sub_addr_id(hex: *const c_char) -> *mut BlsctRetVal;
pub fn get_sub_addr_id_account(blsct_sub_addr_id: *const BlsctSubAddrId) -> i64;
pub fn get_sub_addr_id_address(blsct_sub_addr_id: *const BlsctSubAddrId) -> u64;

// TokenId
pub fn gen_token_id_with_token_and_subid(token: u64, subid: u64) -> *mut BlsctRetVal;
pub fn gen_token_id(token: u64) -> *mut BlsctRetVal;
pub fn gen_default_token_id() -> *mut BlsctRetVal;
pub fn get_token_id_token(blsct_token_id: *const BlsctTokenId) -> u64;
pub fn get_token_id_subid(blsct_token_id: *const BlsctTokenId) -> u64;
pub fn serialize_token_id(blsct_token_id: *const BlsctTokenId) -> *const c_char;
pub fn deserialize_token_id(hex: *const c_char) -> *mut BlsctRetVal;

// TxKey
pub fn from_tx_key_to_view_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_tx_key_to_spending_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;

// ViewTag
pub fn calc_view_tag(
  blinding_pub_key: *const BlsctPubKey,
  view_key: *const BlsctScalar,
) -> u64;

}

