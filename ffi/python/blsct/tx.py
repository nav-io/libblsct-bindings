import blsct
from .managed_obj import ManagedObj
from .tx_in import TxIn
from .tx_out import TxOut
from typing import Any, Self, override

class Tx(ManagedObj):
  @staticmethod
  def generate(
    tx_ins: list[TxIn],
    tx_outs: list[TxOut]
  ) -> Self:
    tx_in_vec = blsct.create_tx_in_vec()
    for tx_in in tx_ins:
      blsct.add_tx_in_to_vec(tx_in_vec, tx_in.value())

    tx_out_vec = blsct.create_tx_out_vec()
    for tx_out in tx_outs:
      blsct.add_tx_out_to_vec(tx_out_vec, tx_out.value())

    rv = blsct.build_tx(tx_in_vec, tx_out_vec)

    # if rv.result == blsct.BLSCT_IN_AMOUNT_ERROR:
    #   blsct.free_obj(rv)
    #   raise ValueError(f"Building Tx failed due to invalid in-amount at index {rv.in_amount_err_index}")
    #
    # if rv.result == blsct.BLSCT_OUT_AMOUNT_ERROR:
    #   blsct.free_obj(rv)
    #   raise ValueError(f"Building Tx failed due to invalid out-amount at index {rv.out_amount_err_index}")

    if rv.result != 0:
      blsct.free_obj(rv)
      raise ValueError(f"Building Tx failed: {rv.result}")

    obj = Tx(rv.ser_tx)
    obj.obj_size = rv.ser_tx_size
    blsct.free_obj(rv)
    return obj

  @override
  def value(self) -> Any:
    return blsct.cast_to_tx(self.obj)

  def serialize(self) -> str:
    return blsct.to_hex(
      blsct.cast_to_uint8_t_ptr(self.value()),
      self.obj_size
    )

  @classmethod
  def deserialize(cls, hex: str) -> Self:
    obj = blsct.hex_to_malloced_buf(hex)
    obj_size = hex.length / 2
    return cls(obj, obj_size) 

