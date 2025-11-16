crate::macros::impl_key!(ViewKey);

crate::keys::child_key_desc::tx_key::impl_tx_key_desc_deser_test!(
  to_view_key,
  ViewKey
);

