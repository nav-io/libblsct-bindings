
crate::macros::impl_key!(BlindingKey);

crate::keys::child_key::impl_child_key_desc_deser_test!(
  to_blinding_key,
  BlindingKey
);
