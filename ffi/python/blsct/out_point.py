from . import blsct
from .managed_obj import ManagedObj
from .serializable import Serializable
from .ctx_id import CtxId
from typing import Any, override, Self, Type

class OutPoint(ManagedObj, Serializable):
  """
  Represents an outpoint of a confidential transaction. Also known as `COutPoint` on the C++ side.

  >>> from blsct import OutPoint, TxId, TX_ID_SIZE
  >>> import secrets
  >>> tx_id = TxId.from_hex(secrets.token_hex(TX_ID_SIZE))
  >>> out_index = 0
  >>> OutPoint.generate(tx_id, out_index)
  OutPoint(<Swig Object of type 'void *' at 0x105b071b0>)  # doctest: +SKIP
  """
  @classmethod
  def generate(cls: Type[Self], ctx_id: CtxId, out_index: int) -> Self:
    """Generate an outpoint from a transaction ID and output index."""
    rv = blsct.gen_out_point(ctx_id.serialize(), out_index)
    inst = cls(rv.value)
    blsct.free_obj(rv)
    return inst

  def serialize(self) -> str:
    """Serialize the OutPoint to a hexadecimal string"""
    return blsct.serialize_out_point(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the OutPoint from a hexadecimal string"""
    return blsct.deserialize_out_point(hex)

  @override
  def value(self) -> Any:
    return blsct.cast_to_out_point(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create an OutPoint without required parameters.")

