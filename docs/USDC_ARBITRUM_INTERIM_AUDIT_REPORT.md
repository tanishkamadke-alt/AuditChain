# AuditChain — Native USDC on Arbitrum One: Interim Security Assessment

**Assessment date:** 24 October 2026  
**Asset:** Native USD Coin (USDC) on Arbitrum One  
**Network / chain ID:** Arbitrum One / 42161  
**Proxy:** `0xaf88d065e77c8cc2239327c5edb3a432268e5831`  
**Expected implementation:** `0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3`  
**Review status:** Source and privileged-control review performed; recent-window minter history query succeeded. Full historical minter enumeration remains incomplete.

## Executive summary

The read-only checks supplied for this assessment report that the USDC proxy's current implementation matches the expected implementation address. The role snapshot reports that the token was not paused and identifies the owner, master minter, pauser, blacklister and proxy administrator. The recent-window event scan observed one minter address and four `MinterConfigured` events in its selected 100,000-block window.

These observations do **not** establish that all minters have been discovered, that the full contract history has been reviewed, or that the contract is free of vulnerabilities. No Critical, High, Medium or Low exploitable vulnerability has been established by the reviewed material. Three informational trust/maintenance observations are recorded below. This is not an independent certification or a claim of exhaustive audit coverage.

## Scope and method

- Review of Circle's published FiatToken / proxy source design as reflected in the repository's existing review notes.
- Read-only Arbitrum RPC checks for implementation, proxy administrator, role addresses, paused state and minting state.
- Read-only Etherscan V2 Logs API scan for `MinterConfigured(address,uint256)` and `MinterRemoved(address)` events in the most recent 100,000 blocks.
- No transactions were submitted and no state was changed.
- No private keys, API keys or credentials are included in this report.

## Evidence snapshots

These checks were performed at different block heights. Values are snapshots and may change.

### Privileged roles and proxy — block 517805160

- Implementation: `0x86E721b43d4ECFa71119Dd38c0f938A75Fdb57B3`
- Expected implementation match: `true`
- Proxy administrator: `0x2E0A67588cfBCAD40f9e4DD76052436190A77a68`
- Owner: `0xc7a599037fDa4Ff8029df9a042Af6053d061ebc9`
- Master minter: `0x8aFf09e2259cacbF4Fc4e3E53F3bf799EfEEab36`
- Pauser: `0x36e3b4db327d9e66F5aE5A0200DCdbEF0D2E240B`
- Blacklister: `0xAC5b4946A8C29Eafb42e1742b3AB82e6D5771329`
- Rescuer: zero address in this snapshot
- Paused: `false`

### Minting state — block 517805971

- Implementation match: `true`
- Paused: `false`
- Total supply: `2,635,342,119.375734 USDC`
- The script did not enumerate all minters in this check because no candidate minter address was supplied.

### Recent minter event scan — block 517812189

- Scan range: blocks `517712190–517812189` (100,000 blocks)
- `MinterConfigured` events observed: 4
- `MinterRemoved` events observed: 0
- Unique addresses observed in this event window: 1
- Currently authorized observed addresses: 1
- Observed address: `0xfd78EE919681417d192449715b2594ab58f5D002`
- Latest observed configuration event block: `517769470`
- Latest observed transaction: `0x955eb8083b6aeb50810adecff8f8bf1fd27d8c7f2056f839026ff4383b7069b2`
- Current authorization at query time: `true`
- Remaining allowance at query time: `331,246,892.553767 USDC`

The remaining allowance is a minting allowance, not the minter's wallet balance, not the amount already minted, and not a global cap on total supply. The large allowance is worth documenting but is not, by itself, proof of a vulnerability.

## Findings

### I-01 — Privileged administrative roles

**Severity:** Informational  
**Status:** Open / trust-model observation

The design includes privileged roles for ownership, minter management, pausing, blacklisting and proxy administration. These roles can affect token issuance, availability, account access and implementation governance.

**Evidence:** Read-only role snapshot above; published FiatToken design roles described in the existing source review.

**Recommendation:** Document the role responsibilities and trust assumptions. Review the operational governance, signer security, key rotation, access separation and incident procedures for each privileged address. Recheck role holders periodically because on-chain values can change.

**Security qualification:** Privileged controls are not automatically vulnerabilities. No exploit or unauthorized role access has been demonstrated by the evidence summarized here.

### I-02 — Upgradeable proxy architecture

**Severity:** Informational  
**Status:** Open / trust-model observation

The proxy can be upgraded by its authorized administrator. Existing source review notes that `upgradeTo`, `upgradeToAndCall` and `changeAdmin` are guarded by the `ifAdmin` authorization modifier, and the implementation setter checks that the target address contains contract code. The current implementation snapshot matches the expected address.

**Evidence:** Proxy administrator and implementation snapshot above; existing review of Circle's `AdminUpgradeabilityProxy` / `UpgradeabilityProxy` source.

**Recommendation:** Monitor `Upgraded` and `AdminChanged` events, independently validate any implementation change, and assess the administrator's governance and key-management controls.

**Security qualification:** Upgradeability is a trust assumption. The reviewed material has not established an authorization bypass.

### I-03 — Legacy Solidity compiler version

**Severity:** Informational  
**Status:** Open / maintenance observation

The reviewed FiatToken source uses Solidity 0.6.12. A legacy compiler version alone does not establish an exploitable defect in the deployed contract.

**Recommendation:** Preserve the verified source/build information and assess compiler migration only with compatibility analysis, reproducible builds and regression testing. The deployed third-party token should not be modified as part of this review.

## Coverage gaps and limitations

1. **Historical minter enumeration is incomplete.** The event scan covers only the most recent 100,000 blocks. An address configured before the scan start and not reconfigured during the window will not be discovered.
2. **No exhaustive list of current minters is claimed.** The recent event scan identifies addresses seen in the selected range, then checks their current authorization and allowance. It does not discover every address that may have been configured earlier.
3. **Role snapshots are point-in-time observations.** Role holders, paused state, implementation and mint allowances can change after the recorded blocks.
4. **Source review is not a complete formal verification.** This report does not claim exhaustive symbolic execution, fuzzing, invariant testing or independent reproduction of every deployed bytecode/build detail.
5. **No exploitable Critical/High/Medium/Low issue is established by the evidence summarized here.** This should not be interpreted as proof that no such issue exists.

## Recommended next steps

1. Run a full historical event scan starting from the independently verified proxy deployment block, with rate-limit-aware retries and durable progress/checkpointing.
2. Reconcile all historical configuration/removal events against current `isMinter` and `minterAllowance` state for every discovered address.
3. Re-run the role and minting snapshots at a single recorded block height if a consistent final evidence package is required.
4. Archive raw JSON outputs and the script commit hashes with the audit record. Never archive the local `.env` file or API key.
5. Keep the dashboard project marked **In Progress** until historical coverage and any remaining review work are completed.

## Reproducible read-only scripts

- `scripts/verify-usdc-roles.mjs`
- `scripts/verify-usdc-minting.mjs`
- `scripts/verify-usdc-minters.mjs`

Run them from the repository root with the required dependencies and local environment configured. Do not commit `.env` or share API keys.

---
**Conclusion:** The available checks support an interim, evidence-based review with three informational trust/maintenance observations. The implementation address matched the expected address in the recorded snapshots. The minter-history scan succeeded for its recent window, but full historical minter coverage remains outstanding; therefore, this assessment is intentionally not labeled a completed exhaustive audit.
