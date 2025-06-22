from . import blsct
from .keys.child_key_desc.tx_key_desc.spending_key import SpendingKey
from .keys.child_key_desc.blinding_key import BlindingKey
from .managed_obj import ManagedObj
from .point import Point
from .range_proof import RangeProof
from .script import Script
from .serializable import Serializable
from .sub_addr import SubAddr
from .token_id import TokenId
from typing import Any, Optional, Literal, override, Self, TypedDict, cast

type hex_str = str

TxOutputType = Literal["Normal", "StakedCommitment"]

class SerTxOut(TypedDict):
  ser_sub_addr: hex_str
  amount: int
  memo: str
  ser_token_id: hex_str
  output_type: TxOutputType
  min_stake: int

class TxOut(ManagedObj, Serializable):
  """
  Represents a transaction output used to construct a CTxOut in a confidential transaction.

  >>> from blsct import ChildKey, DoublePublicKey, PublicKey, SubAddr, SubAddrId, TxOut
  >>> view_key = ChildKey().to_tx_key().to_view_key()
  >>> spending_pub_key = PublicKey()
  >>> sub_addr = SubAddr.from_double_public_key(DoublePublicKey())
  >>> amount = 789
  >>> memo = "apple"
  >>> TxOut.generate(sub_addr, amount, memo)
  TxOut(<Swig Object of type 'void *' at 0x1015fa760>)  # doctest: +SKIP
  """
  def __init__(
    self,
    sub_addr: SubAddr,
    amount: int,
    memo: str,
    token_id: Optional[TokenId] = None,
    output_type: TxOutputType = 'Normal',
    min_stake: int = 0,
  ):
    token_id = TokenId() if token_id is None else token_id

    rv = blsct.build_tx_out(
      sub_addr.value(),
      amount,
      memo,
      token_id.value(),
      blsct.Normal if output_type == "Normal" else blsct.StakedCommitment,
      min_stake
    )
    rv_result = int(rv.result)
    if rv_result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Failed to build TxOut. Error code = {rv_result}")

    obj = rv.value
    obj_size = rv.value_size
    blsct.free_obj(rv)

    super().__init__(obj)
    self.obj_size = obj_size

  def get_destination(self) -> SubAddr:
    """Get the destination of the transaction output."""
    obj = self.value().sub_addr
    x = SubAddr.from_obj(obj)
    x._managed = False
    return x

  def get_amount(self) -> int:
    """Get the amount of the transaction output."""
    return self.value().amount

  def get_memo(self) -> str:
    """Get the memo of the transaction output."""
    return self.value().memo

  def get_token_id(self) -> TokenId:
    """Get the token ID of the transaction output."""
    obj = self.value().token_id
    x = TokenId.from_obj(obj)
    x._managed = False
    return x

  def get_output_type(self) -> TxOutputType:
    """Get the output type of the transaction output."""
    return self.value().output_type

  def get_min_stake(self) -> int:
    """Get the min stake of the transaction output."""
    return self.value().min_stake

  @override
  def value(self) -> Any:
    return blsct.cast_to_tx_out(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create a TxOut without required parameters.")

  def serialize(self) -> str:
    """Serialize the TxOut to a hexadecimal string"""
    return blsct.to_hex(self.value(), self.obj_size)

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the TxOut from a hexadecimal string"""
    if len(hex) % 2 != 0:
      hex = f"0{hex}"
    obj = blsct.hex_to_malloced_buf(hex)
    return cls.from_obj(obj)

