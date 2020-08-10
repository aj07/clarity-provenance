Smart Contract for Provenance
---

This contract provides a basic provenance service. An asset, for example an expensive piece of art, has an owner. If the asset is sold to a new owner, the current owner is allowed to transfer the ownership. The contract maintains a list of all former owners of the asset and makes the list publicy accessible. To prevent manipulation to the provenance record, only the current owner is allowed to make the sale or to transfer the ownership to another person. Once the ownership is transferred, the last owner has no control over the contract. 


Features:
- Maintains a record of current owner of an asset. 
- Only the current owner is allowed to transfer ownership to a new owner. 
- Maintains a public provenance record of all past owners of the asset. 

### Use of endless-list

A provenance list cannot be a finite list with pre-determined size. There is no limit to how many owners an asset can be passed to. Therefore, we use another smart-contract that maintains a non-terminating list ([endless-list](https://github.com/xmakina/endless-list)) to store our provenance. The endless-list contract and the provenance contract is published with the same signature (principal). The provenance contract calls the end-less contract for list operations. 

#### Testing the contract
Basic tests are written in `tests/provenance.ts'. To run the tests, use
```
npm test
```
