import blsct
from .keys.public_key import PublicKey
from .managed_obj import ManagedObj
from .scalar import Scalar
from typing import Any, Self, override

class ViewTag(ManagedObj):
  """
  Represents a view tag consisting of a blinding public key and a view key.

  >>> from blsct import ChildKey, PublicKey, TxKey, ViewTag
  >>> ViewTag()
  <blsct.view_tag.ViewTag object at 0x105b26660>
  >>> blinding_pub_key = PublicKey()
  >>> view_key = ChildKey().to_tx_key().to_view_key()
  >>> ViewTag.generate(blinding_pub_key, view_key)
  <blsct.view_tag.ViewTag object at 0x104bf2900>
  """

  @staticmethod
  def generate(
    blinding_pub_key: PublicKey,
    view_key: Scalar
  ) -> Self:
    """Generate a view tag from blinding public key and view key"""
    obj =  blsct.calc_view_tag(
      blinding_pub_key.value(),
      view_key.value()
    )
    return ViewTag.from_obj(obj)

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

