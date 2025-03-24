import blsct
from typing import Any
from ..child_key import ChildKey
from ..scalar_based_key import ScalarBasedKey
from tx_key_derived.spending_key import SpendingKey
from tx_key_derived.view_key import ViewKey

class TxKey(ScalarBasedKey):
  def __init__(self, child_key: ChildKey):
    # tx_key is of type *BlsctScalar
    tx_key = blsct.from_child_key_to_tx_key(child_key.value())
    super().__init__(tx_key)

  def to_spending_key(self) -> SpendingKey:
    return SpendingKey(self)

  def to_view_key(self) -> ViewKey:
    return ViewKey(self)

