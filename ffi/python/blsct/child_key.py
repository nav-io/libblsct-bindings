import blsct
from typing import Any
from .scalar_based_key import ScalarBasedKey
from ..managed_obj import ManagedObj
from ..scalar import Scalar
from child_key_derived.blinding_key import BlindingKey
from child_key_derived.token_key import TokenKey
from child_key_derived.tx_key import TxKey

class ChildKey(ScalarBasedKey):
  def __init__(self, seed: Scalar):
    # child_key is of type *BlsctScalar
    child_key = blsct.from_seed_to_child_key(seed.value())
    super().__init__(child_key)

  def to_blinding_key(self) -> BlindingKey:
    return BlindingKey(self)

  def to_token_key(self) -> TokenKey:
    return TokenKey(self)

  def to_tx_key(self) -> TxKey:
    return TxKey(self)
