# Memory Management

NavioBlsct is a SWIG binding over `libblsct`. The native library allocates
memory for opaque handles it returns. That memory is **not** managed by the .NET
garbage collector.

## Rule: match the helper

Every native handle **must** be released with the matching helper. Most
`BlsctRetVal.value` handles use `blsct.free_obj(val)`, while `BlsctCTxRetVal`
and `BlsctAmountsRetVal` have dedicated release functions.

Use `blsct.free_obj(val)` for heap-allocated opaque objects:

```csharp
var rv = blsct.gen_scalar(12345);
var scalar = blsct.cast_to_scalar(rv.value);
// ... use scalar ...
blsct.free_obj(rv.value);
```

## Typed delete helpers

Some aggregate objects have dedicated delete calls — use these instead of
`free_obj`:

| Object type              | Free call                                   |
| ------------------------ | ------------------------------------------- |
| `uint64` vector          | `blsct.delete_uint64_vec(vec)`              |
| Range proof vector       | `blsct.delete_range_proof_vec(vec)`         |
| Amount recovery req vec  | `blsct.delete_amount_recovery_req_vec(vec)` |
| String map               | `blsct.delete_string_map(map)`              |
| Token info               | `blsct.delete_token_info(val)`              |
| Unsigned input           | `blsct.delete_unsigned_input(val)`          |
| Unsigned output          | `blsct.delete_unsigned_output(val)`         |
| Unsigned transaction     | `blsct.delete_unsigned_transaction(tx)`     |
| Signed transaction (CTx) | `blsct.delete_ctx(val)`                     |
| Tx hex vector            | `blsct.delete_tx_hex_vec(vec)`              |
| AmountsRetVal            | `blsct.free_amounts_ret_val(rv)`            |

`delete_unsigned_input` and `delete_unsigned_output` are for standalone objects.
When an input or output is added to an unsigned transaction via
`add_unsigned_transaction_input/output`, the data is **copied**. The original
`unsIn`/`unsOut` must still be freed by the caller, and the transaction itself
must be freed via `delete_unsigned_transaction`.

## Pattern: try/finally

```csharp
var rvSeed = blsct.gen_scalar(12345);
try
{
    var seed = blsct.cast_to_scalar(rvSeed.value);
    var childKey = blsct.from_seed_to_child_key(seed);
    // ... use childKey (scalars derived from childKey share its lifetime) ...
}
finally
{
    blsct.free_obj(rvSeed.value);
}
```

## Safe no-op

Passing `null` or a zero-handle to `free_obj` is always safe.

## Values that do NOT need freeing

### Cast wrappers

`cast_to_*` methods return a typed wrapper that points to the **same** native
pointer as the original `RetVal.value`. Freeing both causes a double-free.

```csharp
var rv = blsct.gen_random_point();
var point = blsct.cast_to_point(rv.value);  // same native pointer
// ... use point ...
blsct.free_obj(rv.value);  // correct — frees the native object
// DO NOT call blsct.free_obj(point) — double-free
```

Apply this rule to all `cast_to_*` variants: `cast_to_scalar`, `cast_to_point`,
`cast_to_pub_key`, `cast_to_tx_in`, `cast_to_tx_out`, `cast_to_token_id`,
`cast_to_sub_addr`, `cast_to_dpk`, `cast_to_signature`, `cast_to_script`,
`cast_to_out_point`, `cast_to_sub_addr_id`, `cast_to_key_id`,
`cast_to_range_proof`, `cast_to_vector_predicate`, `cast_to_uint256`,
`cast_to_cscript`, `cast_to_const_char_ptr`, etc.

**Rule:** free the `RetVal.value` once. Never free the cast wrapper.

### Derived scalars from the same source

Scalars derived from a `BlsctRetVal.value` via `cast_to_scalar` share the same
native allocation:

```csharp
var rvDestPk = blsct.gen_scalar(92);
var destPkScalar = blsct.cast_to_scalar(rvDestPk.value);  // same pointer
var destPk = blsct.scalar_to_pub_key(destPkScalar);       // NEW allocation — must free
blsct.free_obj(rvDestPk.value);  // frees destPkScalar's native memory too
blsct.free_obj(destPk);          // correct — destPk is a separate allocation
```

### Ownership notes

`sign_unsigned_transaction` reads the unsigned transaction but does **not**
delete it. The caller must still call `delete_unsigned_transaction(unsTx)` after
signing.

`add_unsigned_transaction_input/output` **copy** the input/output into the
transaction. The original `unsIn`/`unsOut` must still be freed by the caller
(via `delete_unsigned_input`/`delete_unsigned_output`).

| Function                          | Ownership          | Caller cleanup                       |
| --------------------------------- | ------------------ | ------------------------------------ |
| `sign_unsigned_transaction`       | reads, no transfer | `delete_unsigned_transaction(unsTx)` |
| `add_unsigned_transaction_input`  | copies `unsIn`     | `delete_unsigned_input(unsIn)`       |
| `add_unsigned_transaction_output` | copies `unsOut`    | `delete_unsigned_output(unsOut)`     |

### Returned string pointers

Functions like `serialize_*`, `buf_to_malloced_hex_c_str`, and
`cast_to_const_char_ptr` return heap-allocated `char*` strings. Free them with
`blsct.free_obj(val)`:

```csharp
var rvSigned = blsct.sign_unsigned_transaction(unsTx);
var signedHex = blsct.cast_to_const_char_ptr(rvSigned.value);
// ... use signedHex ...
blsct.free_obj(rvSigned.value);  // frees the char*
```
