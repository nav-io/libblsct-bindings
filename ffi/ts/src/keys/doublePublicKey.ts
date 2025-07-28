import {
  castToDpk,
  deserializeDpk,
  freeObj,
  genDoublePubKey,
  genDpkWithKeysAndSubAddrId,
  serializeDpk,
} from '../blsct'

import { ManagedObj } from '../managedObj'
import { PublicKey } from './publicKey'
import { ViewKey } from './childKeyDesc/txKeyDesc/viewKey'

export class DoublePublicKey extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      const pk1 = PublicKey.random()
      const pk2 = PublicKey.random()
      const dpk = DoublePublicKey.fromPublicKeys(pk1, pk2)
      super(dpk.move())
    }
  }

  static fromPublicKeys(
    pk1: PublicKey,
    pk2: PublicKey,
  ): DoublePublicKey {
    const rv = genDoublePubKey(pk1.value(), pk2.value())
    const dpk = DoublePublicKey.fromObj(rv.value)
    freeObj(rv)
    return dpk
  }

  static fromKeysAndAcctAddr(
    viewKey: ViewKey,
    spendingPubKey: PublicKey,
    account: number,
    address: number
  ): DoublePublicKey {
    const obj = genDpkWithKeysAndSubAddrId(
      viewKey.value(),
      spendingPubKey.value(),
      account,
      address
    )
    return DoublePublicKey.fromObj(obj) 
  }

  override value(): any {
    return castToDpk(this.obj)
  }

  override serialize(): string {
    return serializeDpk(this.value())
  }

  static deserialize(
    this: new (obj: any) => DoublePublicKey,
    hex: string
  ): DoublePublicKey {
    return DoublePublicKey._deserialize(hex, deserializeDpk)
  }
}

/*
class DoublePublicKey(ManagedObj, Serializable):
  @classmethod
  def from_keys_and_acct_addr(
    cls: Type[Self],
    view_key: Scalar,
    spending_pub_key: PublicKey,
    account: int,
    address: int
  ) -> Self:
*/
