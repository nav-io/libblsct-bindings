import blsct
from .managed_obj import ManagedObj
from typing import Any, Self, override

class Script(ManagedObj):
  """
  Represents a script.
  """
  def to_hex(self) -> str:
    buf = blsct.cast_to_uint8_t_ptr(self.value())
    return blsct.to_hex(buf, blsct.SCRIPT_SIZE)

  @override
  def value(self):
    return blsct.cast_to_uint8_t_ptr(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create a Script without required parameters.")

