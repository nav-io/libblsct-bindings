crate::macros::impl_key!(SpendingKey);

crate::keys::child_key_desc::tx_key::impl_tx_key_desc_deser_test!(
  to_spending_key,
  SpendingKey
);

