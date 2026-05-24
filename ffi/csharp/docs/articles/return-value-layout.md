# Return Value Types

All fallible native functions return a SWIG-mapped result type. There are four
variants depending on what the function produces.

## BlsctRetVal

The most common return type. Fields:

| Field        | Type              | Meaning                                             |
| ------------ | ----------------- | --------------------------------------------------- |
| `result`     | `byte`            | `0` = success, non-zero = error                     |
| `value`      | `SWIGTYPE_p_void` | Opaque pointer to the native obj                    |
| `value_size` | `uint`            | Byte size (used by range proofs, vector predicates) |

```csharp
var rv = blsct.gen_scalar(42);
if (rv.result != 0) throw new Exception("failed");
var scalar = blsct.cast_to_scalar(rv.value);
// ...
blsct.free_obj(rv.value);
```

## BlsctBoolRetVal

Returned by boolean-result functions such as `verify_range_proofs`.

| Field    | Type   | Meaning                         |
| -------- | ------ | ------------------------------- |
| `result` | `byte` | `0` = success, non-zero = error |
| `value`  | `bool` | The boolean result              |

```csharp
var rv = blsct.verify_range_proofs(rpVec);
if (rv.result != 0) throw new Exception("failed");
bool valid = rv.value;
```

## BlsctAmountsRetVal

Returned by `recover_amount`. Use `blsct.free_amounts_ret_val(rv)` to free.

| Field    | Type              | Meaning                         |
| -------- | ----------------- | ------------------------------- |
| `result` | `byte`            | `0` = success, non-zero = error |
| `value`  | `SWIGTYPE_p_void` | Pointer to amounts result array |

Access individual results with:

```csharp
blsct.get_amount_recovery_result_size(rv.value)       // uint
blsct.get_amount_recovery_result_is_succ(rv.value, i) // bool
blsct.get_amount_recovery_result_amount(rv.value, i)  // ulong
blsct.get_amount_recovery_result_msg(rv.value, i)     // string
blsct.get_amount_recovery_result_gamma(rv.value, i)   // SWIGTYPE_p_BlsctScalar
```

## BlsctCTxRetVal

Returned by signed transaction construction functions.

| Field                  | Type              | Meaning                              |
| ---------------------- | ----------------- | ------------------------------------ |
| `result`               | `byte`            | `0` = success, non-zero = error      |
| `ctx`                  | `SWIGTYPE_p_void` | Pointer to the signed CTx            |
| `in_amount_err_index`  | `uint`            | Index of the first bad input amount  |
| `out_amount_err_index` | `uint`            | Index of the first bad output amount |
