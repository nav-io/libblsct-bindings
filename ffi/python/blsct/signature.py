import blsct
from .managed_obj import ManagedObj
from .public_key import PublicKey
from .scalar import Scalar
from typing import Any, Self, override

class Signature(ManagedObj):
  def __init__(self, obj):
    super().__init__(obj)

  @staticmethod
  def generate(priv_key: Scalar, msg: str) -> Self:
    sig = blsct.sign_message(priv_key.value(), msg)
    return Signature(sig)

  def verify(self, msg: str, pub_key: PublicKey) -> bool:
    return blsct.verify_msg_sig(pub_key.value(), msg, self.value())

  @override
  def value(self) -> Any:
    return blsct.cast_to_signature(self.obj)

  @override
  def default(self) -> Self:
    name = self.__class__.__name__
    raise NotImplementedError(f"{name}.default()")

