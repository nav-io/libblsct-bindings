import {
  castToScript,
  deserializeScript,
  serializeScript,
} from './blsct'

import { ManagedObj } from './managedObj';

export class Script extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToScript(this.obj)
  }

  override serialize(): string {
    return serializeScript(this.value())
  }

  static deserialize(
    this: new (obj: any) => Script,
    hex: string
  ): Script {
    return Script._deserialize(hex, deserializeScript)
  }
}

