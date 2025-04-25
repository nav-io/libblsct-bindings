import blsct
from ...scalar_based_key import ScalarBasedKey

class ViewKey(ScalarBasedKey):
  """
  Represents a view key. A view key is a Scalar and introduces no new functionality; it serves purely as a semantic alias.

  >>> from blsct import ViewKey
  >>> ViewKey()
  """
  pass

