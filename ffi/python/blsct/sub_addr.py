import blsct
from .managed_obj import ManagedObj
from .scalar import Scalar
from .keys.public_key import PublicKey
from .sub_addr_id import SubAddrId
from typing import Any, Self, override

class SubAddr(ManagedObj):
  @staticmethod
  def generate(
    view_key: Scalar,
    spending_pub_key: PublicKey,
    sub_addr_id: SubAddrId,
  ) -> Self:
    obj = blsct.derive_sub_address(
      view_key.value(),
      spending_pub_key.value(),
      sub_addr_id.value(),
    )
    return SubAddr(obj)

  @override
  def value(self) -> Any:
    return blsct.cast_to_sub_addr(self.obj)

  @override
  def default(self) -> Self:
    name = self.__class__.__name__
    raise NotImplementedError(f"{name}.default()")

