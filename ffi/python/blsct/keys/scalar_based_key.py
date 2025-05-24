from .. import blsct
from ..managed_obj import ManagedObj
from ..serializable import Serializable
from ..scalar import Scalar
from typing import Any, override, Self, Type

class ScalarBasedKey(ManagedObj, Serializable):
  @override
  def value(self) -> Any:
    return blsct.cast_to_scalar(self.obj)

  @override
  def serialize(self) -> str:
    """Serialize the ScalarBasedKey object to a hexadecimal string."""
    return blsct.scalar_to_hex(self.value())

  def to_scalar(self) -> Scalar:
    return Scalar.from_obj(self.value())

  @classmethod
  @override
  def deserialize(
    cls: Type[Self],
    hex: str,
  ) -> Self:
    """Create a ScalarBasedKey from a hexadecimal string."""
    return blsct.hex_to_scalar(hex)

  @classmethod
  @override
  def default_obj(cls: Type[Self]) -> Any:
    rv = blsct.gen_random_scalar()
    value = rv.value
    blsct.free_obj(rv)
    return value
