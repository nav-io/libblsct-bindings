from . import blsct
from .managed_obj import ManagedObj
from .serializable import Serializable
from typing import Any, Self, override

class Script(ManagedObj, Serializable):
  """
  Represents a script, which may be a scriptPubKey, scriptSig, or scriptWitness. Also known as `CScript` on the C++ side.


  A :class:`Script` appears as an attribute of :class:`TxOut` (scriptPubKey) or :class:`TxIn` (scriptSig and scriptWitness), and is not meant to be instantiated directly.
  """
  def __init__(self, obj: Any = None):
    super().__init__(obj)

  @override
  def value(self):
    return blsct.cast_to_script(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot directly instantiate create a Script without required parameters.")

  def serialize(self) -> str:
    """Serialize the Script to a hexadecimal string"""
    return blsct.serialize_script(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the Script from a hexadecimal string"""
    rv = blsct.deserialize_script(hex)
    rv_result = int(rv.result)
    if rv_result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Failed to deserialize OutPoint. Error code = {rv_result}")

    obj = rv.value
    blsct.free_obj(rv)
    return cls.from_obj(obj) 
