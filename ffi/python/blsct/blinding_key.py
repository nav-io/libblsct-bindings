import blsct
from typing import Any
from ..child_key import ChildKey
from ..scalar_based_key import ScalarBasedKey

class BlindingKey(ScalarBasedKey):
  def __init__(self, child_key: ChildKey):
    # blinding_key is of type *BlsctScalar
    blinding_key = blsct.from_child_key_to_blinding_key(child_key.value())
    super().__init__(blinding_key)
 
