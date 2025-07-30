export class AmountRecoveryRes {
  isSucc: boolean
  amount: number
  msg: string

  constructor(
    isSucc: boolean,
    amount: number,
    msg: string,
  ) {
    this.isSucc = isSucc
    this.amount = amount
    this.msg = msg
  }

  toString(): string {
    return `${this.constructor.name}(${this.isSucc}, ${this.amount}, ${this.msg})`
  }

  serialize(): string {
    const jsonStr = JSON.stringify(this)
    const buf = Buffer.from(jsonStr, 'utf-8')
    return buf.toString('hex')
  }

  deserialize(hex: string): AmountRecoveryRes {
    let obj: any
    try {
      const json = Buffer.from(hex, 'hex').toString('utf8')
      obj = JSON.parse(json)
    } catch (e) {
      throw new Error(`Failed to deserialize to object: ${JSON.stringify(e)}`)
    }

    if (
      typeof obj !== 'object' ||
      typeof obj.isSucc !== 'boolean' ||
      typeof obj.amount !== 'number' ||
      typeof obj.msg !== 'string'
    ) {
      throw new Error(`Deserialize object is not AmountRecoveryRes: ${hex}`)
    }

    return new AmountRecoveryRes(
      obj.isSucc,
      obj.amount,
      obj.msg,
    )
  }
}

