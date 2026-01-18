from .. import blsct
from ..managed_obj import ManagedObj
from .public_key import PublicKey
from ..scalar import Scalar
from ..serializable import Serializable
from typing import Any, override, Self, Type

class DoublePublicKey(ManagedObj, Serializable):
  """
  The unique source from which an address is derived.

  Instantiating a DoublePublicKey object without a parameter returns a DoublePublicKey consisting of two randomly generated PublicKeys.

  >>> from blsct import DoublePublicKey, PublicKey, Scalar
  >>> DoublePublicKey()
  DoublePublicKey(889636dce7b7706ad4...) # doctest: +SKIP
  >>> view_key = PublicKey()
  >>> spend_key = PublicKey()
  >>> DoublePublicKey.from_view_and_spend_keys(view_key, spend_key)
  DoublePublicKey(8284d61a300241dcbe...) # doctest: +SKIP
  >>> vk = Scalar()
  >>> spending_pk = PublicKey()
  >>> DoublePublicKey.from_keys_acct_addr(vk, spending_pk, 1, 2)
  DoublePublicKey(8eb6d5f160935d06a1a...) # doctest: +SKIP
  >>> dpk = DoublePublicKey()
  >>> ser = dpk.serialize()
  >>> deser = DoublePublicKey.deserialize(ser)
  >>> deser.serialize() == ser
  True
  """
  def __init__(self, obj: Any = None):
    super().__init__(obj)

  @classmethod
  def from_view_and_spend_keys(
    cls: Type[Self],
    view_key: PublicKey,
    spend_key: PublicKey,
  ) -> Self:
    """Create a DoublePublicKey from view and spend PublicKeys."""
    rv = blsct.gen_double_pub_key(view_key.value(), spend_key.value())
    dpk = cls(rv.value)
    blsct.free_obj(rv)
    return dpk

  @classmethod
  def from_keys_acct_addr(
    cls: Type[Self],
    view_key: Scalar,
    spending_pub_key: PublicKey,
    account: int,
    address: int
  ) -> Self:
    """Create a DoublePublicKey from a view key, spending public key, account, and address."""
    obj = blsct.gen_dpk_with_keys_acct_addr(
      view_key.value(),
      spending_pub_key.value(),
      account,
      address
    )
    return cls(obj) 

  @override
  def serialize(self) -> str:
    """Serialize the DoublePublicKey to a hexadecimal string"""
    return blsct.serialize_dpk(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the DoublePublicKey from a hexadecimal string"""
    if len(hex) % 2 != 0:
      hex = f"0{hex}"
    rv = blsct.deserialize_dpk(hex)
    rv_result = int(rv.result)
    if rv_result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Failed to deserialize DoublePublicKey. Error code = {rv_result}")

    obj = rv.value
    blsct.free_obj(rv)
    return cls.from_obj(obj) 

  @override
  def value(self):
    return blsct.cast_to_dpk(self.obj)

  @override
  @classmethod
  def default_obj(cls: Type[Self]) -> Self:
    view_key = PublicKey()
    spend_key = PublicKey()
    tmp = DoublePublicKey.from_view_and_spend_keys(view_key, spend_key)
    obj = tmp.move()
    return obj

