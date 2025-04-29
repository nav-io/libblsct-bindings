import blsct
from .managed_obj import ManagedObj
from typing import Any, Self, override

class OutPoint(ManagedObj):
  """
  Represents an outpoint of a transaction.

  >>> from blsct import OutPoint
  """
  @override
  def value(self) -> Any:
    return blsct.cast_to_out_point(self.obj)

  @staticmethod
  def generate(tx_id: str, out_index: int) -> Self:
    """Generate an OutPoint object from a transaction ID and output index."""
    rv = blsct.gen_out_point(tx_id, out_index)
    inst = OutPoint(rv.value)
    blsct.free_obj(rv)
    return inst

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create an OutPoint without required parameters.")

