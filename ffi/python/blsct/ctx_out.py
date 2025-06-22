from . import blsct
from .keys.child_key_desc.tx_key_desc.spending_key import SpendingKey
from .keys.child_key_desc.blinding_key import BlindingKey
from .managed_obj import ManagedObj
from .point import Point
from .range_proof import RangeProof
from .script import Script
from typing import Any, override

class CTxOut(ManagedObj):
  """
  Represents a transaction output in a constructed confidential transaction. Also known as `CTxOut` on the C++ side. This class provides access to the CTxOut object, but does not own it.
  """
  def __init__(self, obj: Any):
    self._managed = False
    super().__init__(obj)

  # TODO is this needed?
  def get_value(self) -> int:
    """Get the value of the transaction output."""
    return blsct.get_tx_out_value(self.value())

  def get_script_pub_key(self) -> Script:
    """Get the scriptPubKey of the transaction output."""
    obj = blsct.get_tx_out_script_pubkey(self.value())
    return Script.from_obj(obj)

  # blsct data
  def get_spending_key(self) -> SpendingKey:
    """Get the spending key of the transaction output."""
    obj = blsct.get_tx_out_spending_key(self.value())
    return SpendingKey.from_obj(obj)

  # blsct data
  def get_ephemeral_key(self) -> Point:
    """Get the ephemeral key of the transaction output."""
    obj = blsct.get_tx_out_ephemeral_key(self.value())
    return Point.from_obj(obj)

  # blsct data
  def get_blinding_key(self) -> BlindingKey:
    """Get the blinding key of the transaction output."""
    obj = blsct.get_tx_out_blinding_key(self.value())
    return BlindingKey.from_obj(obj)

  # blsct data
  def get_range_proof(self) -> RangeProof:
    """Get the scriptPubKey of the transaction output."""
    obj = blsct.get_tx_out_range_proof(self.value())
    return RangeProof.from_obj(obj)

  # blsct data
  def get_view_tag(self) -> int:
    """Get the view tag of the transaction output."""
    return blsct.get_tx_out_view_tag(self.value())

  @override
  def value(self) -> Any:
    return blsct.cast_to_tx_out(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("CTxOut should not be directly instantiated.")

