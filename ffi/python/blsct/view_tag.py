import blsct
from .keys.child_key_desc.tx_key_desc.view_key import ViewKey
from .keys.public_key import PublicKey
from .managed_obj import ManagedObj
from .scalar import Scalar
from typing import Any, Self, override

class ViewTag():
  """
  Represents a view tag derived from a blinding public key and a view key.

  >>> from blsct import ChildKey, PublicKey, TxKey, ViewTag
  >>> ViewTag()
  ViewTag(0x102cb0c20)  # doctest: +SKIP
  >>> blinding_pub_key = PublicKey()
  >>> view_key = ChildKey().to_tx_key().to_view_key()
  >>> ViewTag.generate(blinding_pub_key, view_key)
  12212  # doctest: +SKIP
  """

  @staticmethod
  def generate(
    blinding_pub_key: PublicKey,
    view_key: ViewKey
  ) -> Self:
    """Generate a view tag from blinding public key and view key"""
    return blsct.calc_view_tag(
      blinding_pub_key.value(),
      view_key.value()
    )

  def __str__(self):
    name = self.__class__.__name__
    return f"{name}({hex(id(self))})"

  def __repr__(self):
    return self.__str__()

  @override
  def value(self):
    return blsct.cast_to_view_tag(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    blinding_pub_key = PublicKey()
    view_key = Scalar.random()

    return blsct.calc_view_tag(
      blinding_pub_key.value(),
      view_key.value()
    )

