from . import blsct
from .serializable import Serializable
from .keys.public_key import PublicKey
from .keys.child_key_desc.tx_key_desc.view_key import ViewKey
from .managed_obj import ManagedObj
from typing import Any, override, Self, Type

class HashId(ManagedObj, Serializable):
  """
  Represents a hash ID consisting of a blinding public key, a spending public key, and a view key. Also known as `CKeyId` which is an alias for `uint160` on the C++ side.
  
  >>> from blsct import ChildKey, HashId, PublicKey, ViewKey
  >>> HashId()
  HashId(23f95dc276b53d83b4f3d85b50cce9649240da0f)  # doctest: +SKIP
  >>> blinding_pub_key = PublicKey()
  >>> spending_pub_key = PublicKey()
  >>> view_key = ChildKey().to_tx_key().to_view_key()
  >>> hash_id = HashId.generate(blinding_pub_key, spending_pub_key, view_key)
  >>> hash_id.serialize()
  '81fe3aefff3e90dcd9862aad1527dc034e5045d4'  # doctest: +SKIP
  >>> HashId.deserialize(HashId().serialize())
  '81fe3aefff3e90dcd9862aad1527dc034e5045d4'  # doctest: +SKIP
  """
  @classmethod
  def generate(
    cls: Type[Self],
    blinding_pub_key: PublicKey,
    spending_pub_key: PublicKey,
    view_key: ViewKey
  ) -> Self:
    """Generate a hash ID from blinding public key, spending public key and view key"""
    obj = blsct.calc_key_id(
      blinding_pub_key.value(),
      spending_pub_key.value(),
      view_key.value()
    )
    return cls(obj)

  def serialize(self) -> str:
    """Serialize the HashId to a hexadecimal string"""
    return blsct.serialize_key_id(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the HashId from a hexadecimal string"""
    obj = blsct.deserialize_key_id(hex)
    return cls.from_obj(obj)

  @override
  def value(self) -> Any:
    return blsct.cast_to_key_id(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    blinding_pub_key = PublicKey()
    spending_pub_key = PublicKey()
    view_key = ViewKey()

    return blsct.calc_key_id(
      blinding_pub_key.value(),
      spending_pub_key.value(),
      view_key.value()
    )

