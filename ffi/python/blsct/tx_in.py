from . import blsct
from .keys.child_key_desc.tx_key_desc.spending_key import SpendingKey
from .managed_obj import ManagedObj
from .out_point import OutPoint
from .serializable import Serializable
from .keys.child_key_desc.tx_key_desc.spending_key import SpendingKey
from .token_id import TokenId
from typing import Any, override, Self, TypedDict

type hex_str = str

class SerTxIn(TypedDict):
  amount: int
  gamma: int
  ser_spending_key: hex_str
  ser_token_id: hex_str
  ser_out_point: hex_str
  rbf: bool

class TxIn(ManagedObj, Serializable):
  """
  Represents a transaction input used to construct CTxIn in a confidential transaction.
  
  >>> from blsct import OutPoint, SpendingKey, TokenId, TxId, TxIn, TX_ID_SIZE
  >>> import secrets
  >>> amount = 123
  >>> gamma = 100
  >>> spending_key = SpendingKey()
  >>> token_id = TokenId()
  >>> tx_id = TxId.from_hex(secrets.token_hex(TX_ID_SIZE))
  >>> out_point = OutPoint.generate(tx_id, 0)
  >>> tx_in = TxIn.generate(amount, gamma, spending_key, token_id, out_point)
  >>> tx_in.get_prev_out_hash()
  TxId(7b0000000000000064000000000000003ff98b71ff7189fb12d4b93704139753)  # doctest: +SKIP
  >>> tx_in.get_prev_out_n()
  37194817  # doctest: +SKIP
  >>> tx_in.get_script_sig()
  Script(341a3e3e18b462d20000000000000000000000000000000000000000)  # doctest: +SKIP
  >>> tx_in.get_sequence()
  0  # doctest: +SKIP
  >>> tx_in.get_script_witness()
  Script(ffffffffffffffff1b585a44e980f30b16ef75db34f7a6d56fe7cee4)  # doctest: +SKIP
  """

  def __init__(
    self,
    amount: int,
    gamma: int,
    spending_key: SpendingKey,
    token_id: TokenId,
    out_point: OutPoint,
    rbf: bool
  ):
    rv = blsct.build_tx_in(
      amount,
      gamma,
      spending_key.value(),
      token_id.value(),
      out_point.value(),
      rbf
    )
    rv_result = int(rv.result)
    if rv_result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Failed to build TxIn. Error code = {rv_result}")

    obj = rv.value
    obj_size = rv.value_size
    blsct.free_obj(rv)

    super().__init__(obj)
    self.obj_size = obj_size

  def get_amount(self) -> int:
    """Get the amount of the transaction input."""
    return self.value().amount # TODO confirm this works

  def get_gamma(self) -> int:
    """Get the gamma value of the transaction input."""
    return self.value().gamma # TODO confirm this works

  def get_spending_key(self) -> SpendingKey:
    """Get the spending key of the transaction input."""
    obj = SpendingKey.from_obj(self.value().spending_key)
    obj._managed = False
    return obj

  def get_token_id(self) -> TokenId:
    """Get the token ID of the transaction input."""
    obj = TokenId.from_obj(self.value().token_id)
    obj._managed = False # TODO confirm this works
    return obj

  def get_out_point(self) -> OutPoint:
    """Get the out point of the transaction input."""
    obj = OutPoint.from_obj(self.value().out_point) # TODO confirm this works
    obj._managed = False
    return OutPoint.from_obj(obj)

  def get_rbf(self) -> bool:
    """Get the replace-by-fee flag of the transaction input."""
    return self.value().rbf # TODO confirm this works

  @override
  def value(self) -> Any:
    return blsct.cast_to_tx_in(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create a TxIn without required parameters.")

  def serialize(self) -> str:
    """Serialize the TxIn to a hexadecimal string"""
    return blsct.to_hex(self.value(), self.obj_size)

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the TxIn from a hexadecimal string"""
    if len(hex) % 2 != 0:
      hex = f"0{hex}"
    obj = blsct.hex_to_malloced_buf(hex)
    return cls.from_obj(obj)

