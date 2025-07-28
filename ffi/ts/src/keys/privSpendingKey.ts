import {
  calcPrivSpendingKey,
} from '../blsct'

import { Scalar } from '../scalar'
import { PublicKey } from './publicKey'
import { SpendingKey } from './childKeyDesc/txKeyDesc/spendingKey'
import { ViewKey } from './childKeyDesc/txKeyDesc/viewKey'

export class PrivSpendingKey extends Scalar {
  constructor(
    blindingPubKey: PublicKey,
    viewKey: ViewKey,
    spendingKey: SpendingKey,
    account: number,
    address: number
  ) {
    const blsctPsk = calcPrivSpendingKey(
      blindingPubKey.value(),
      viewKey.value(),
      spendingKey.value(),
      account,
      address
    )
    super(blsctPsk)
  }
}

