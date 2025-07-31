import {
  calcViewTag,
} from './blsct'

import { PublicKey } from './keys/publicKey'
import { ViewKey } from './keys/childKeyDesc/txKeyDesc/viewKey'

export class ViewTag {
  value: number

  constructor(
    blindingPubKey: PublicKey,
    viewKey: ViewKey
  ) {
    this.value = calcViewTag(
      blindingPubKey.value(),
      viewKey.value()
    )
  }

  static random(): ViewTag {
    const blindingPubKey = PublicKey.random()
    const viewKey = ViewKey.random()
    return new ViewTag(blindingPubKey, viewKey)
  }
}

