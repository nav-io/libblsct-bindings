from . import blsct
from .managed_obj import ManagedObj
from .scalar import Scalar
from .keys.child_key_desc.tx_key_desc.view_key import ViewKey
from .keys.double_public_key import DoublePublicKey
from .keys.public_key import PublicKey
from .serializable import Serializable
from .sub_addr_id import SubAddrId
from typing import Any, override, Self, Type

class SubAddr(ManagedObj, Serializable):
  """
  Represents a sub-address.

  >>> from blsct import ChildKey, DoublePublicKey, PublicKey, SubAddr, SubAddrId
  >>> view_key = ChildKey().to_tx_key().to_view_key()
  >>> spending_pub_key = PublicKey()
  >>> sub_addr_id = SubAddrId.generate(123, 456)
  >>> SubAddr.generate(view_key, spending_pub_key, sub_addr_id)
  SubAddr(<Swig Object of type 'BlsctSubAddr *' at 0x101738e40>)  # doctest: +SKIP
  >>> dpk = DoublePublicKey()
  >>> SubAddr.from_double_public_key(dpk)
  SubAddr(<Swig Object of type 'void *' at 0x101152760>)  # doctest: +SKIP
  """
  def __init__(
    self,
    view_key: ViewKey,
    spending_pub_key: PublicKey,
    sub_addr_id: SubAddrId,
  ):
    obj = blsct.derive_sub_address(
      view_key.value(),
      spending_pub_key.value(),
      sub_addr_id.value(),
    )
    super().__init__(obj)

  @classmethod
  def from_double_public_key(
      cls: Type[Self],
      dpk: DoublePublicKey,
    ) -> Self:
    """Derive a sub-address from a DoublePublicKey"""
    rv = blsct.dpk_to_sub_addr(dpk.value())
    inst = cls.from_obj(rv.value)
    blsct.free_obj(rv)
    return inst

  @override
  def value(self) -> Any:
    return blsct.cast_to_sub_addr(self.obj)

  @classmethod
  @override
  def default_obj(cls: Type[Self]) -> Self:
    raise NotImplementedError(f"Cannot create a SubAddr without required parameters.")

  def serialize(self) -> str:
    """Serialize the SubAddr to a hexadecimal string"""
    return blsct.serialize_sub_addr(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the SubAddr from a hexadecimal string"""
    rv = blsct.deserialize_sub_addr(hex)

    rv_result = int(rv.result)
    if rv_result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Failed to deserialize SubAddr. Error code = {rv_result}")

    obj = rv.value
    blsct.free_obj(rv)
    return cls.from_obj(obj) 













