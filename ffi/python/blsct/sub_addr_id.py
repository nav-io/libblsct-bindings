from . import blsct
from .managed_obj import ManagedObj
from .serializable import Serializable
from typing import Any, override, Self, Type

class SubAddrId(ManagedObj, Serializable):
  """
  Represents a sub-address ID.

  >>> from blsct import SubAddrId
  >>> SubAddrId.generate(123, 456)
  SubAddrId(<Swig Object of type 'BlsctSubAddrId *' at 0x1017194d0>)
  """
  def __init__(
    self,
    account: int,
    address: int
  ):
    """Generate a sub-address ID from an account and an address"""
    obj = blsct.gen_sub_addr_id(account, address);
    super.__init__(obj)

  @override
  def value(self) -> Any:
    return blsct.cast_to_sub_addr_id(self.obj)

  @classmethod
  @override
  def default_obj(cls: Type[Self]) -> Self:
    raise NotImplementedError(f"Cannot create a SubAddrId without required parameters.")

  def serialize(self) -> str:
    """Serialize the SubAddrId to a hexadecimal string"""
    raise NotImplementedError()

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the SubAddrId from a hexadecimal string"""
    raise NotImplementedError()

