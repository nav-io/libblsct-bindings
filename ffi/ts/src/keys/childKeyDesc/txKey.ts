import {
  fromTxKeyToSpendingKey,
  fromTxKeyToViewKey
} from '../../blsct'

import { Scalar } from '../../scalar'
import { SpendingKey } from './txKeyDesc/spendingKey'
import { ViewKey } from './txKeyDesc/viewKey'

export class TxKey extends Scalar {
  constructor(obj: any) {
    super(obj)
  }

  toSpendingKey(): SpendingKey {
    const obj = fromTxKeyToSpendingKey(this.value())
    return new SpendingKey(obj)
  }

  toViewKey(): ViewKey {
    const obj = fromTxKeyToViewKey(this.value())
    return new ViewKey(obj)
  }
}

