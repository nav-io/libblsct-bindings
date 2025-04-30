class AmountRecoveryRes:
  """
  The result of recovering a single amount from a non-aggregated range proof.
  """
  def __init__(
    self,
    is_succ: bool,
    amount: int,
    message: str,
  ):
    self.is_succ = is_succ
    self.amount = amount
    self.message = message
  
  def __str__(self):
    is_succ = self.is_succ
    amount = self.amount
    message = self.message
    return f"AmtRecoveryRes{is_succ=}:{amount=}:{message=}"

