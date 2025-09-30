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
pub struct BlsctBoolRetVal {
  pub result: u8,
  pub value: bool,
}

#[repr(C)]
#[derive(Debug)]
pub struct BlsctAmountsRetVal {
  pub result: u8,
  pub value: *mut c_void, // = Vec<*mut BlsctAmountRecoveryResult>
}

#[repr(C)]
#[derive(Debug)]
pub struct BlsctAmountRecoveryReq {
  range_proof: *mut BlsctRangeProof,
  range_proof_size: usize,
  nonce: *mut BlsctPoint,
}

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
pub struct BlsctTxIn {
  amount: u64,
  gamma: u64,
  spending_key: BlsctScalar,
  token_id: BlsctTokenId,
  out_point: BlsctOutPoint,
  staked_commitment: bool,
  rbf: bool,
}

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
pub struct BlsctTxOut {
  dest: BlsctSubAddr,
  amount: u64,
  memo_c_str: [u8; MEMO_BUF_SIZE],
  token_id: BlsctTokenId,
  output_type: TxOutputType,
  min_stake: u64,
}

#[repr(C)]
#[derive(Debug)]
pub enum AddressEncoding {
  Bech32,
  Bech32M,
}

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
pub enum TxOutputType {
  Normal,
  StakedCommitment
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
pub const MAX_MEMO_LEN: usize = 100;
pub const MEMO_BUF_SIZE: usize = MAX_MEMO_LEN + 1;

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

pub type BlsctRangeProof = u8;

extern "C" {

pub fn malloc(size: usize) -> *mut core::ffi::c_void;
pub fn free_obj(x: *mut c_void);
pub fn free_amounts_ret_val(rv: *mut BlsctAmountsRetVal);

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

// RangeProof
pub fn build_range_proof(
  vp_uint64_vec: *const c_void,
  blsct_nonce: *const BlsctPoint,
  blsct_msg: *const c_char,
  blsct_token_id: *const BlsctTokenId,
) -> *mut BlsctRetVal;

pub fn verify_range_proofs(
  vp_range_proofs: *const c_void,
) -> *mut BlsctBoolRetVal;

pub fn gen_amount_recovery_req(
  vp_blsct_range_proof: *const c_void,
  range_proof_size: usize,
  vp_blsct_nonce: *const c_void,
) -> *mut BlsctAmountRecoveryReq;

pub fn recover_amount(
  vp_amt_recovery_req_vec: *mut c_void
) -> *mut BlsctAmountsRetVal;

pub fn get_range_proof_A(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctPoint;

pub fn get_range_proof_A_wip(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctPoint;

pub fn get_range_proof_B(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctPoint;

pub fn get_range_proof_r_prime(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctScalar;

pub fn get_range_proof_s_prime(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctScalar;

pub fn get_range_proof_delta_prime(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctScalar;

pub fn get_range_proof_alpha_hat(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctScalar;

pub fn get_range_proof_tau_x(
  blsct_range_proof: *const BlsctRangeProof,
  range_proof_size: usize,
) -> *mut BlsctScalar;

pub fn serialize_range_proof(
  blsct_range_proof: *const BlsctRangeProof,
  obj_size: usize,
) -> *const c_char;

pub fn deserialize_range_proof(
  hex: *const c_char,
  obj_size: usize,
) -> *mut BlsctRetVal;

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

// TxIn
pub fn build_tx_in(
  amount: u64,
  gamma: u64,
  spending_key: *const BlsctScalar,
  token_id: *const BlsctTokenId,
  out_point: *const BlsctOutPoint,
  staked_commitment: bool,
  rbf: bool,
) -> *mut BlsctRetVal;

pub fn get_tx_in_amount(tx_in: *const BlsctTxIn) -> u64;
pub fn get_tx_in_gamma(tx_in: *const BlsctTxIn) -> u64;
pub fn get_tx_in_spending_key(tx_in: *const BlsctTxIn) -> *mut BlsctScalar;
pub fn get_tx_in_token_id(tx_in: *const BlsctTxIn) -> *mut BlsctTokenId;
pub fn get_tx_in_out_point(tx_in: *const BlsctTxIn) -> *mut BlsctOutPoint;
pub fn get_tx_in_staked_commitment(tx_in: *const BlsctTxIn) -> bool;
pub fn get_tx_in_rbf(tx_in: *const BlsctTxIn) -> bool;

// TxOut
pub fn build_tx_out(
  blsct_dest: *const BlsctSubAddr,
  amount: u64,
  memo_c_str: *const c_char,
  blsct_token_id: *const BlsctTokenId,  
  output_type: TxOutputType,
  min_stake: u64,
) -> *mut BlsctRetVal;

pub fn get_tx_out_destination(tx_out: *const BlsctTxOut) -> *const BlsctSubAddr;
pub fn get_tx_out_amount(tx_out: *const BlsctTxOut) -> u64;
pub fn get_tx_out_memo(tx_out: *const BlsctTxOut) -> *const c_char;
pub fn get_tx_out_token_id(tx_out: *const BlsctTxOut) -> *const BlsctTokenId;
pub fn get_tx_out_output_type(tx_out: *const BlsctTxOut) -> TxOutputType;
pub fn get_tx_out_min_stake(tx_out: *const BlsctTxOut) -> u64;

// TxKey
pub fn from_tx_key_to_view_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;
pub fn from_tx_key_to_spending_key(tx_key: *const BlsctScalar) -> *mut BlsctScalar;

// ViewTag
pub fn calc_view_tag(
  blinding_pub_key: *const BlsctPubKey,
  view_key: *const BlsctScalar,
) -> u64;

// Misc helper functions
pub fn succ(value: *mut c_void, value_size: usize) -> *mut BlsctRetVal;
pub fn hex_to_malloced_buf(hex: *const c_char) -> *mut u8;
pub fn buf_to_malloced_hex_c_str(buf: *const u8, size: usize) -> *const c_char;

// uint64 vector
pub fn create_uint64_vec() -> *mut c_void;
pub fn add_to_uint64_vec(vp_uint64_vec: *mut c_void, n: u64);
pub fn delete_uint64_vec(vp_vec: *mut c_void);

// range proof vector
pub fn create_range_proof_vec() -> *mut c_void;
pub fn add_to_range_proof_vec(
  vp_range_proofs: *mut c_void,
  blsct_range_proof: *const BlsctRangeProof,
  blsct_range_proof_size: usize,
);
pub fn delete_range_proof_vec(vp_range_proofs: *const c_void);

// amount recovery request vector
pub fn create_amount_recovery_req_vec() -> *mut c_void;

pub fn add_to_amount_recovery_req_vec(
  vp_amt_recovery_req_vec: *mut c_void,
  vp_amt_recovery_req: *mut c_void,
);

pub fn delete_amount_recovery_req_vec(vp_amt_recovery_req_vec: *mut c_void);

pub fn get_amount_recovery_result_size(
  vp_amt_recovery_res_vec: *mut c_void
) -> i16;

pub fn get_amount_recovery_result_is_succ(
  vp_amt_recovery_req_vec: *mut c_void,
  idx: usize,
) -> bool;

pub fn get_amount_recovery_result_amount(
  vp_amt_recovery_req_vec: *mut c_void,
  idx: usize,
) -> u64;

pub fn get_amount_recovery_result_msg(
  vp_amt_recovery_req_vec: *mut c_void,
  idx: usize,
) -> *const c_char;

} // extern "C"

