import blsct
from .managed_obj import ManagedObj
from typing import Any, Self, override

class OutPoint(ManagedObj):
  """
  Represents an outpoint of a confidential transaction.

  >>> from blsct import OutPoint, TxId, TX_ID_SIZE
  >>> import secrets
  >>> hex = secrets.token_hex(TX_ID_SIZE)
  >>> tx_id = TxId.from_hex(hex)
  >>> tx_id_hex = tx_id.to_hex()
  >>> out_index = 0
  >>> OutPoint.generate(tx_id_hex, out_index)
  <blsct.out_point.OutPoint object at 0x1032c6f90>  # doctest: +SKIP
  """
  @staticmethod
  def generate(tx_id_hex: str, out_index: int) -> Self:
    """Generate an outpoint from a transaction ID and output index."""
    rv = blsct.gen_out_point(tx_id_hex, out_index)
    inst = OutPoint(rv.value)
    blsct.free_obj(rv)
    return inst

  @override
  def value(self) -> Any:
    return blsct.cast_to_out_point(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create an OutPoint without required parameters.")

