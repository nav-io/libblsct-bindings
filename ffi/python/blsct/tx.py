import blsct
from .managed_obj import ManagedObj
from .tx_in import TxIn
from .tx_out import TxOut
from typing import Any, Self, override

# stores serialized tx represented as uint8_t*
class Tx(ManagedObj):
  """
  Represents a confidential transaction.

  >>> from blsct import ChildKey, DoublePublicKey, OutPoint, PublicKey, SpendingKey, SubAddr, SubAddrId, TokenId, TX_ID_SIZE, Tx, TxId, TxIn, TxOut
  >>> import secrets
  >>> num_tx_in = 1
  >>> num_tx_out = 1
  >>> default_fee = 200000
  >>> fee = (num_tx_in + num_tx_out) * default_fee
  >>> out_amount = 10000
  >>> in_amount = fee + out_amount
  >>> out_amount = out_amount
  >>> tx_id = TxId.from_hex(secrets.token_hex(32))
  >>> out_index = 0
  >>> out_point = OutPoint.generate(tx_id, out_index)
  >>> gamma = 100
  >>> spending_key = SpendingKey()
  >>> token_id = TokenId()
  >>> tx_in = TxIn.generate(in_amount, gamma, spending_key, token_id, out_point)
  >>> sub_addr = SubAddr.from_double_public_key(DoublePublicKey())
  >>> tx_out = TxOut.generate(sub_addr, out_amount, 'navio')
  >>> tx = Tx.generate([tx_in], [tx_out])
  >>> for tx_in in tx.get_tx_ins(): 
  ...   print(f"prev_out_hash: {tx_in.get_prev_out_hash()}")
  ...   print(f"prev_out_n: {tx_in.get_prev_out_n()}")
  ...   print(f"script_sig: {tx_in.get_script_sig().to_hex()}")
  ...   print(f"sequence: {tx_in.get_sequence()}")
  ...   print(f"script_witness: {tx_in.get_script_witness().to_hex()}")
  ...   
  prev_out_hash: TxId(b1166eabed80a211639e07c9382b905706123e51f35088d7b9ccfb768161adce)  # doctest: +SKIP
  prev_out_n: 0  # doctest: +SKIP
  script_sig: 00000000000000000000000000000000000000000000000000000000  # doctest: +SKIP
  sequence: 4294967295  # doctest: +SKIP
  script_witness: 00000000000000000000000000000000000000000000000000000000  # doctest: +SKIP
  >>> for tx_out in tx.get_tx_outs():
  ...   print(f"value: {tx_out.get_value()}")
  ...   print(f"script_pub_key: {tx_out.get_script_pub_key().to_hex()}")
  ...   print(f"token_id: token={tx_out.get_token_id().token()}, subid={tx_out.get_token_id().subid()}")
  ...   print(f"spending_key: {tx_out.get_spending_key()}")
  ...   print(f"ephemeral_key: {tx_out.get_ephemeral_key()}")
  ...   print(f"blinding_key: {tx_out.get_blinding_key()}")
  ...   print(f"view_tag: {tx_out.get_view_tag()}")
  ...   print(f"range_proof.A: {tx_out.get_range_proof_A().to_hex()}")
  ...   print(f"range_proof.B: {tx_out.get_range_proof_B().to_hex()}")
  ...   print(f"range_Proof.r_prime: {tx_out.get_range_proof_r_prime()}")
  ...   print(f"range_proof.s_prime: {tx_out.get_range_proof_s_prime()}")
  ...   print(f"range_proof.delta_prime: {tx_out.get_range_proof_delta_prime()}")
  ...   print(f"range_proof.alpha_hat: {tx_out.get_range_proof_alpha_hat()}")
  ...   print(f"range_proof.tau_x: {tx_out.get_range_proof_tau_x()}")
  ...   
  value: 0  # doctest: +SKIP
  script_pub_key: 51000000000000000000000000000000000000000000000000000000  # doctest: +SKIP
  token_id: token=0, subid=18446744073709551615  # doctest: +SKIP
  spending_key: Point(1 43c0386c950f8298bd2a6416dfb2696f08e155a76227f789eff0a78d8a7d0c1926b8b5de97818bff168917e8dec199d 170cdcb9cfc862168dfbfc52dea568ef38b2bdd424e17a7e5ebf72205c7e1c6a9783ee5e2719a77d684f1e3d1ee90cd)  # doctest: +SKIP
  ephemeral_key: Point(1 dbb54183f593cbb325c258a2f506feda30938d7ac5135e70fd695f596a8401a965c79b1d86c99bd935a9bdf7d0f7d63 19c3fb04fb219dedd2d0b328127edfc32de671874ed37db578f8c35a20215245abced2f511dd613a3a6bec06c892c43)  # doctest: +SKIP
  blinding_key: Point(1 11bfe37be891928ac997a4713ed23b20a4754c9acc59a223141637b31b6b478e1e5e3566ae2f57098199bdfaa2e0347a 5a88b4430f2e6bb3e066e97448e5246494e4057f7162dbabdee67018c56e5d46e88c91f1279662a5466b0cb09d557f)  # doctest: +SKIP
  view_tag: 43421  # doctest: +SKIP
  range_proof.A: 1 d1a9ece6622f7e9b1e4538ebadf8586054507823a8bf6752e30ac808963da12abcd0658351691197de6f0b1631723bf 72ed6a826f0c81bd803f55c64aed35b3dee639ef5f9023d73184ca05cc27f87b67374b1ead95dedb28ed6133e97c42  # doctest: +SKIP
  range_proof.B: 1 7f5c8c20c84286b59554aa4baeba056f97b69a4deb79bb646461bb6b69109a7888d6c28f457f95859e3cd14de30eea7 b22e8d359cdf4e9aa66579f94017aba1a4fcd146364f7555a5c97c5df33eb61583a9882469edd30555be5f67ea05ad  # doctest: +SKIP
  range_Proof.r_prime: Point(0)  # doctest: +SKIP
  range_proof.s_prime: Point(0)  # doctest: +SKIP
  range_proof.delta_prime: Point(0)  # doctest: +SKIP
  range_proof.alpha_hat: Point(0)  # doctest: +SKIP
  range_proof.tau_x: Scalar(707fe053abde7620ba50206b52c94f57d8301a70230c97fb0c9bbc10f6660a18)  # doctest: +SKIP
  value: 0  # doctest: +SKIP
  script_pub_key: 51000000000000000000000000000000000000000000000000000000  # doctest: +SKIP
  token_id: token=0, subid=18446744073709551615  # doctest: +SKIP
  spending_key: Point(1 187232c232f64c69aabdcc972fa53ee6348070dd95485d87e83381c51bf3390342473c27308293d2abe5f43660e38e5d 4768f24b50c7865c795231319d5347dbf60e5bbb3e317ef421d31a1893ef917647865fd4d12fdb8794f9a011b61cf7)  # doctest: +SKIP
  ephemeral_key: Point(1 f307fb2f34626f0da7af6bba99616eb3156d298ecbbda78551dbdb50a1e5fcdc171970ed07df01bcedacb4b56d606da be1c4985d574bca1a46f49e181144428e8ab22e2d33ada48720d6c307c97d1abc49a6a624b0db33f215766af2458d5)  # doctest: +SKIP
  blinding_key: Point(0)  # doctest: +SKIP
  view_tag: 21881  # doctest: +SKIP
  range_proof.A: 1 731fba528d2461adc510c2cea6538cb4c31869448ee04f83665aa24a83c6a79aff088893d908ad7df4236e8c10a7ed1 7f2fd4146dc6cf5e25f1e7334d364cf2463505e2c772e66ba7ecfcd7970ff8d38a7e3fa943adaacebeb336a9d21b76  # doctest: +SKIP
  range_proof.B: 1 af830e83f6438cc9bdcc52be4d43f09b330f849b6c61a825d003748716ef59b51904dc482f65ce6609bc90ed06ccb90 17c2b3479186582f7e831c2b62b2f2adadb38bd76f7a87ab6da34f2639d267d1567c6d24f2a67ae991291261abe3416  # doctest: +SKIP
  range_Proof.r_prime: Point(0)  # doctest: +SKIP
  range_proof.s_prime: Point(0)  # doctest: +SKIP
  range_proof.delta_prime: Point(0)  # doctest: +SKIP
  range_proof.alpha_hat: Point(0)  # doctest: +SKIP
  range_proof.tau_x: Scalar(4193251795eaf35243e68c9fef5dd7cafd3c34bcc0422c5c5b8f825c56767546)  # doctest: +SKIP
  value: 292125  # doctest: +SKIP
  script_pub_key: 6a000000000000000000000000000000000000000000000000000000  # doctest: +SKIP
  token_id: token=0, subid=18446744073709551615  # doctest: +SKIP
  spending_key: Point(0)  # doctest: +SKIP
  ephemeral_key: Point(0)  # doctest: +SKIP
  blinding_key: Point(0)  # doctest: +SKIP
  view_tag: 0  # doctest: +SKIP
  range_proof.A: 0  # doctest: +SKIP
  range_proof.B: 0  # doctest: +SKIP
  range_Proof.r_prime: Point(0)  # doctest: +SKIP
  range_proof.s_prime: Point(0)  # doctest: +SKIP
  range_proof.delta_prime: Point(0)  # doctest: +SKIP
  range_proof.alpha_hat: Point(0)  # doctest: +SKIP
  range_proof.tau_x: Scalar(0)  # doctest: +SKIP
  >>> ser_tx = tx.serialize()
  >>> ser_tx
  '2200000001b1166eabed80a211639e07c9382b905706123e51f35088d7b9ccfb768161adce0000000000ffffffff03ffffffffffffff7f0100000000000000015101825eae57529175e9a83e24c5236df3011105573f3a8ef513c7357cc796e9001c857df4849181c369eea2527ca9a3061a06b5c708aa87fe6afaa5965d7e2b6edfa356b099e59570df951af55246bafde1f4503e1e135a1dbbcb460baddc37b89e10b78119db31d2e345b656a7db95e24c24e4fcbab45815e2c9c1d1d6661e267a28b3a5ba04227e36e33d7e3f107d1faeb9affd5fb6542ff7553093525eff1cef9b850dfc8f340943ed499c42e7d7af73b8df9ac61bb8a2d9fd6d5b89bab311bb8c8d217e596db86115aff0f0bfa664d204c4a406022b5dc9362ae18409a41050b67151aac8d6241109b8dc32377f216ca6966384fe4be97a1c5c5501d97bac8479d77e2b5648a1ad1dd81521834d9e281b012431d2b8fa0a60ba014e1d6e4525f18e0bcab71e4cff7223de21f4d9834ad1457ea0f53433eb12fef927148f6d343f3532ccaad61708999c1689a96e692e7906a8cb86f977552fd97b53a081c9939c40234729def0741809f91b6a0eb3d98a676e2cd7db10533293f1473743ba19faf0b55dfa1c90f28efe0f64636665a6432a79c7c63b5cfbb9d602158d07c2978fe2b850f7111d495d11b40167d84f76d2c5922af7e70a62253c18cbefed61c2909b8a330df088ca7a281b685727cd25159c14662937968c4e352b18a1bebb9b57a6b9c141489820e0256c40c967fcab659a2ab32ed1c7837096567eb5c2d3b5ff82131a60140f9887ed32bc350f8517f560a57587417574ff89d1902b8b289cbcf17026a5529472497525457ad28c8b39e5ae439621942d541b1c9eb68539219494867100208392face97bb52211c2b7c71e658d9aba642265ff75d954bd0dfbdc93c360f50f70e96317814b257b24a47d48d1a9ece6622f7e9b1e4538ebadf8586054507823a8bf6752e30ac808963da12abcd0658351691197de6f0b1631723bfaa2f4ff4234243ce0880223be7c0de18074a241f89ed95853c889ebc5c0f2d73da0079ab4199ee4d9afed655f7a0045c87f5c8c20c84286b59554aa4baeba056f97b69a4deb79bb646461bb6b69109a7888d6c28f457f95859e3cd14de30eea70ae0d21c54dfcebd3ea837db65b35f62936694d0ee0cd42b26ae6c4fa2efa62d42c4137bdf31cd2951ac30867ff1d235e581cedd6b78e7ee7ef4756e147381af4231c6221510b7f0348e2886df9edc10788b634fb6404893e5ffb9bf58b5966e411d2488f7b865055610c492d82f4fb4d75f60495e27ee07fcfd98da95a6dea0707fe053abde7620ba50206b52c94f57d8301a70230c97fb0c9bbc10f6660a18a43c0386c950f8298bd2a6416dfb2696f08e155a76227f789eff0a78d8a7d0c1926b8b5de97818bff168917e8dec199d91bfe37be891928ac997a4713ed23b20a4754c9acc59a223141637b31b6b478e1e5e3566ae2f57098199bdfaa2e0347aadbb54183f593cbb325c258a2f506feda30938d7ac5135e70fd695f596a8401a965c79b1d86c99bd935a9bdf7d0f7d639da9ffffffffffffff7f010000000000000001510185ec7411f59529da2a651b3a8207facbe156eff42464f6b977e594afa2614f61d3f71b4a6724422d6d474ea3eb91adfb0682472da4d8f3d696ebd84d43f85e3a72d836212c847b0cb1c37db06a997cdf4490b686b480dbe0dba82ebd89c63d7c9299c3ce8443e13876bca3bf197978dba116d294a3ae5192678e041463deae846493a76089ddaefb7461d4a5f6d3028558b7d534cea5904251e90d56706f96691ecca47d3a873dcec65d0c0e4fd0baebdd6c489b0221b2f0e3cc2a1e0288733169a5e0bbc611edf9bc7b9982cb735f4b27b3a02fdf98e02f9bd5cf8a375e4df119b363810dbba88f765e6a464dd9739494872fce2fd31a8ecbc63a3489beed95a3c341e7370f98767892116dc952bef4455f20a79f2b532ba2e7e8eb8a927d774fa00429aff645d8ef6b07cf4493f0a2de1b19eb7e8bc66ebf11af8a5ab8093d82fd3cec61a177c25c19394c10c8b8dc0406a16337c7f11e41e19f22f9a9d99589279efcfcc932b8c64bc5e5f9e75ad4540a8a5481170e2541f326959bcebe7602c1895e58eaec4dbf9f269ee9fe040c9a5a663e871f32321cb2131118fa3424a5e32d2b7f91eb7cc51c7b4959b26c527c0da71eb5ec245c78b2415ef44ee7b767e18bde6cabc721ceceb05735153baba45cdad683612cfce61d5ec989f3ab0edad396c709655c9a36d4a07a09bea264731dd3cf3a5644721b8f81bc5fb2ab06917a32424103fc6607990f7e03c5e47bd7a7aab3e75fa7ae507867b02a64d5c5b6b97ae2368da0b3b031574d7006a6e6c25d102fd29b973575da70d7480158908024b10f5bc3f906dc2207fd12136feb640ea28e3a201ce5e2af6a64d47e997f36ae77a0b7905074b97e69ee97a14c73fe518731fba528d2461adc510c2cea6538cb4c31869448ee04f83665aa24a83c6a79aff088893d908ad7df4236e8c10a7ed18320e3fe36484b669dcd9d0edb29d9062f3fe523af00f30fdb67bdc7de2bcdad963d833bc2c35de54073e13c722a2558aaf830e83f6438cc9bdcc52be4d43f09b330f849b6c61a825d003748716ef59b51904dc482f65ce6609bc90ed06ccb906292405b114ceaa5d92f89a5c63a4c4a12f95f35572460132de5aa2cf00bc47e640a0b56bfe7312791b21b96dadbeb8b156fc5d3e9cff17f1f60268490353f276e400a97dff0a1aaf21d6674b53bd091327f142c93858c9e386314f2ddc5b8386c99352423c2ff98671fdc97fefc00dc427022c88bab93acf1a5ed2d28311d264193251795eaf35243e68c9fef5dd7cafd3c34bcc0422c5c5b8f825c56767546987232c232f64c69aabdcc972fa53ee6348070dd95485d87e83381c51bf3390342473c27308293d2abe5f43660e38e5dc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008f307fb2f34626f0da7af6bba99616eb3156d298ecbbda78551dbdb50a1e5fcdc171970ed07df01bcedacb4b56d606da7955ffffffffffffff7f0c000000000000001d75040000000000016a31038e83e3fbb5c90d5363cf2d0b1c37edf66e5d2b0927636dd434db9857bdf325cfd3556619d088a817c510d2572839fcf200000000b654e2db0401068d6eb3f5f6bd15efeda91d199c2888438c76013bc6fd08f54827d2f23b666739309fd0d745726d44b016bebfca24fe665fb2045d74bfd86cbf8bf2a469a7a9ad566be16e678cf27af4ba51e0161a206e5b890cc0e141f17299'  # doctest: +SKIP
  >>> tx.deserialize(ser_tx)
  Tx(<swig object of type 'unsigned char *' at 0x102529080>)  # doctest: +SKIP
  """
  @staticmethod
  def generate(
    tx_ins: list[TxIn],
    tx_outs: list[TxOut]
  ) -> Self:
    """generate a confidential transaction from a list of inputs and outputs."""

    tx_in_vec = blsct.create_tx_in_vec()
    for tx_in in tx_ins:
      blsct.add_tx_in_to_vec(tx_in_vec, tx_in.value())

    tx_out_vec = blsct.create_tx_out_vec()
    for tx_out in tx_outs:
      blsct.add_tx_out_to_vec(tx_out_vec, tx_out.value())

    rv = blsct.build_tx(tx_in_vec, tx_out_vec)

    # if rv.result == blsct.blsct_in_amount_error:
    #   blsct.free_obj(rv)
    #   raise valueerror(f"building tx failed due to invalid in-amount at index {rv.in_amount_err_index}")
    #
    # if rv.result == blsct.blsct_out_amount_error:
    #   blsct.free_obj(rv)
    #   raise valueerror(f"building tx failed due to invalid out-amount at index {rv.out_amount_err_index}")

    if rv.result != 0:
      blsct.free_obj(rv)
      raise valueerror(f"building tx failed: {rv.result}")

    obj = tx(rv.ser_tx)
    obj.obj_size = rv.ser_tx_size
    blsct.free_obj(rv)
    return obj

  def get_tx_ins(self) -> list[TxIn]:
    """Get the transaction inputs."""
    # returns cmutabletransaction*
    blsct_tx = blsct.deserialize_tx(self.value(), self.obj_size)

    blsct_tx_ins = blsct.get_tx_ins(blsct_tx)
    tx_ins_size = blsct.get_tx_ins_size(blsct_tx_ins)

    tx_ins = []
    for i in range(tx_ins_size):
      rv = blsct.get_tx_in(blsct_tx_ins, i)
      tx_in = txin(rv.value)
      tx_ins.append(tx_in)
      blsct.free_obj(rv)
    blsct.free_obj(blsct_tx)

    return tx_ins

  def get_tx_outs(self) -> list[TxOut]:
    """Get the transaction outputs."""
    # returns cmutabletransaction*
    blsct_tx = blsct.deserialize_tx(self.value(), self.obj_size)

    blsct_tx_outs = blsct.get_tx_outs(blsct_tx)
    tx_outs_size = blsct.get_tx_outs_size(blsct_tx_outs)

    tx_outs = []
    for i in range(tx_outs_size):
      rv = blsct.get_tx_out(blsct_tx_outs, i)
      tx_out = txout(rv.value)
      tx_outs.append(tx_out)
      blsct.free_obj(rv)
    blsct.free_obj(blsct_tx)

    return tx_outs

  def serialize(self) -> str:
    """Serialize the transaction to a hexadecimal string."""
    return blsct.to_hex(
      blsct.cast_to_uint8_t_ptr(self.value()),
      self.obj_size
    )

  @classmethod
  def deserialize(cls, hex: str) -> Self:
    """Deserialize a transaction from a hexadecimal string."""
    obj = blsct.hex_to_malloced_buf(hex)
    inst = cls(obj) 
    inst.obj_size = int(len(hex) / 2)
    return inst

  @override
  def value(self) -> Any:
    # self.obj is uint8_t*
    return blsct.cast_to_uint8_t_ptr(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    raise NotImplementedError("Cannot create a Tx without required parameters.")

