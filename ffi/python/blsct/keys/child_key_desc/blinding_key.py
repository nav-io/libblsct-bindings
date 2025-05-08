import blsct
from ..scalar_based_key import ScalarBasedKey
from typing import Any

class BlindingKey(ScalarBasedKey):
  """
  Represents a blinding key. A blinding key is a Scalar and introduces no new functionality; it serves purely as a semantic alias.

  >>> from blsct import BlindingKey
  >>> BlindingKey()
  BlindingKey(117d9c8a5cd6d8c7415655a2c4fed9264f4c8493bdf9e1ec201aea2b2459b085)  # doctest: +SKIP
  """
  pass
 
