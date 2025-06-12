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
  Represents a transaction output in a confidential transaction.

  A standalone :class:`TxOut` object contains placeholder values.
  Refer to :class:`Tx` for examples of how its fields are populated in a full transaction.

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
    blsct.free_obj(rv)
    super().__init__(obj)

  def get_value(self) -> int:
    """Get the value of the transaction output."""
    return blsct.get_tx_out_value(self.value())

  def get_script_pub_key(self) -> Script:
    """Get the scriptPubKey of the transaction output."""
    obj = blsct.get_tx_out_script_pubkey(self.value())
    return Script.from_obj(obj)

  def get_token_id(self) -> TokenId:
    """Get the scriptPubKey of the transaction output."""
    obj = blsct.get_tx_out_token_id(self.value())
    return TokenId.from_obj(obj)

  # blsct data
  def get_spending_key(self) -> SpendingKey:
    """Get the spending key of the transaction output."""
    obj = blsct.get_tx_out_spending_key(self.value())
    return SpendingKey.from_obj(obj)

  # blsct data
  def get_ephemeral_key(self) -> Point:
    """Get the ephemeral key of the transaction output."""
    obj = blsct.get_tx_out_ephemeral_key(self.value())
    return Point.from_obj(obj)

  # blsct data
  def get_blinding_key(self) -> BlindingKey:
    """Get the blinding key of the transaction output."""
    obj = blsct.get_tx_out_blinding_key(self.value())
    return BlindingKey.from_obj(obj)

  # blsct data
  def get_range_proof(self) -> RangeProof:
    """Get the scriptPubKey of the transaction output."""
    obj = blsct.get_tx_out_range_proof(self.value())
    return RangeProof.from_obj(obj)

  # blsct data
  def get_view_tag(self) -> int:
    """Get the view tag of the transaction output."""
    return blsct.get_tx_out_view_tag(self.value())

  @override
  def value(self) -> Any:
    return blsct.cast_to_tx_out(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create a TxOut without required parameters.")

  def serialize(self) -> str:
    """Serialize the TxOut to a hexadecimal string"""
    return blsct.serialize_tx_out(self.value())

  @classmethod
  @override
  def deserialize(cls, hex: str) -> Self:
    """Deserialize the TxOut from a hexadecimal string"""
    if len(hex) % 2 != 0:
      hex = f"0{hex}"
    rv = blsct.deserialize_tx_out(hex)
    rv_result = int(rv.result)

    if rv_result != 0:
      blsct.free_obj(rv)
      raise RuntimeError(f"Deserializaiton failed. Error code = {rv_result}")  # pragma: no co
    return cls.from_obj(rv.value)

