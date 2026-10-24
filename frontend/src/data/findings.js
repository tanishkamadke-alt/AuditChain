export const findings = [
  {
    id: "I-01",
    projectId: 1,
    severity: "Informational",
    title: "Centralized Administrative Controls",
    status: "Open",
    description:
      "Administrative roles and proxy administration introduce trust and centralization considerations.",
    recommendation:
      "Maintain strong administrative key management and clearly document the trust assumptions associated with privileged controls.",
  },

  {
    id: "I-02",
    projectId: 1,
    severity: "Informational",
    title: "Legacy Solidity Compiler",
    status: "Open",
    description:
      "The reviewed implementation uses Solidity 0.6.12, which is a legacy compiler version.",
    recommendation:
      "For future development, consider upgrading to a currently supported Solidity compiler version after compatibility and regression testing.",
  },
  {
    id: "I-01", projectId: 2, severity: "Informational",
    title: "Privileged Administrative Roles", status: "Open",
    description: "The FiatToken design includes privileged roles for pausing, blacklisting, minter management, ownership and proxy administration. These controls are part of the token's trust model and can affect token availability and account access.",
    recommendation: "Document the responsibilities and trust assumptions for each role. Verify current on-chain role holders and review their key-management arrangements as a deployment-level check.",
    evidence: "Circle's published FiatToken design documents owner, admin, masterMinter, pauser, blacklister and minter roles."
  },
  {
    id: "I-02", projectId: 2, severity: "Informational",
    title: "Upgradeable Proxy Architecture", status: "Open",
    description: "Source review confirms that upgradeTo, upgradeToAndCall, and changeAdmin are guarded by the proxy's ifAdmin authorization modifier. The implementation setter also rejects addresses without deployed contract code. Upgradeability remains a trust assumption because the authorized proxy administrator can replace token logic; no authorization bypass has been established by this source review.",
    recommendation: "Monitor Upgraded and AdminChanged events, independently validate implementation changes before relying on them, and review the proxy administrator's key-management and governance controls. Treat this as an informational trust-model observation unless further evidence demonstrates a concrete weakness.",
    evidence: "Circle AdminUpgradeabilityProxy.sol: ifAdmin checks msg.sender against the stored proxy admin; upgradeTo and upgradeToAndCall are admin-gated, changeAdmin rejects the zero address, and UpgradeabilityProxy._setImplementation checks Address.isContract(newImplementation). Live read-only snapshot at Arbitrum block 517805160 reported implementation 0x86E721b43d4ECFa71119Dd38c0f938A75Fdb57B3 (matching expected) and proxy admin 0x2E0A67588cfBCAD40f9e4DD76052436190A77a68."
  },
  {
    id: "I-03", projectId: 2, severity: "Informational",
    title: "Legacy Solidity Compiler Version", status: "Open",
    description: "The reviewed FiatTokenV2_2 source declares Solidity 0.6.12. This is a legacy compiler version, but the version alone does not demonstrate an exploitable defect in the deployed token.",
    recommendation: "Record the compiler version as a maintenance consideration and validate build reproducibility against the verified deployed source. Any compiler migration should include compatibility and regression testing.",
    evidence: "The reviewed FiatTokenV2_2 source contains pragma solidity 0.6.12."
  },
];