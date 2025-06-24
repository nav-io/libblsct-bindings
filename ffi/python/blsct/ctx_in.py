from . import blsct
from .managed_obj import ManagedObj
from .script import Script
from .ctx_id import CtxId
from typing import Any, override

class CTxIn(ManagedObj):
  """
  Represents a transaction input in a constructed confidential transaction. Also known as `CTxIn` on the C++ side. This class provides access to the CTxIn object but does not own it.
  """

  def __init__(self, obj: Any):
    self._managed = False
    super().__init__(obj)

  def get_prev_out_hash(self) -> CtxId:
    """Get the transaction ID of the previous output being spent."""
    obj = blsct.get_ctx_in_prev_out_hash(self.value())
    return CtxId.from_obj(obj)

  def get_prev_out_n(self) -> int:
    """Get the output index of the previous output being spent."""
    return blsct.get_ctx_in_prev_out_n(self.value())

  def get_script_sig(self) -> Script:
    """Get the scriptSig used to unlock the previous output."""
    obj = blsct.get_ctx_in_script_sig(self.value())
    return Script.from_obj(obj)

  def get_sequence(self) -> int:
    """Get the sequence field of the transaction input."""
    return blsct.get_ctx_in_sequence(self.value())

  def get_script_witness(self) -> Script:
    """Get the scriptWitness for the transaction input."""
    obj = blsct.get_ctx_in_script_witness(self.value())
    return Script.from_obj(obj)

  @override
  def value(self) -> Any:
    return blsct.cast_to_ctx_in(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("CTxIn should not be directly instantiated.")

