from . import blsct
from .managed_obj import ManagedObj
from .serializable import Serializable
from typing import Any, override, Type, Self

class CtxId(ManagedObj, Serializable):
  """
  Represents the transaction ID of a CMutableTransaction

  >>> from blsct import CTxId, TX_ID_SIZE
  >>> import secrets
  >>> hex = secrets.token_hex(TX_ID_SIZE)
  >>> tx_id = CTxId.deserialize(hex)
  >>> tx_id.to_hex()
  'f60b407e98916361594ecd53d7bed716fb901570815c323244da8d4189833df3'  # doctest: +SKIP
  """
  @override
  def serialize(self) -> str:
    """Serialize the CtxId object to a hexadecimal string."""
    buf = blsct.cast_to_uint8_t_ptr(self.value())
    return blsct.to_hex(buf, blsct.TX_ID_SIZE)

  @classmethod
  @override
  def deserialize(
    cls: Type[Self],
    hex: str,
  ) -> Self:
    """Create a TxId from a hexadecimal string."""
    if len(hex) != blsct.TX_ID_SIZE * 2:
      raise ValueError(f"Invlid TxId hex length. Expected {blsct.TX_ID_SIZE * 2}, but got {len(hex)}.")
    obj = blsct.hex_to_malloced_buf(hex) 
    return cls(obj)

  @override
  def value(self):
    return blsct.cast_to_uint8_t_ptr(self.obj)

  @classmethod
  @override
  def default_obj(cls: Type[Self]) -> Any:
    raise NotImplementedError("Cannot create a CtxId without required parameters.")

