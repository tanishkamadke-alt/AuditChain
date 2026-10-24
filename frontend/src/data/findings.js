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
    id: "I-03", projectId: 2, severity: "Informational",
    title: "Privileged Administrative Roles", status: "Open",
    description: "The FiatToken design includes privileged roles for pausing, blacklisting, minter management, ownership and proxy administration. These controls are part of the token's trust model and can affect token availability and account access.",
    recommendation: "Document the responsibilities and trust assumptions for each role. Verify current on-chain role holders and review their key-management arrangements as a deployment-level check.",
    evidence: "Circle's published FiatToken design documents owner, admin, masterMinter, pauser, blacklister and minter roles."
  },
  {
    id: "I-04", projectId: 2, severity: "Informational",
    title: "Upgradeable Proxy Architecture", status: "Open",
    description: "The FiatTokenProxy forwards calls to an implementation and allows implementation upgrades through a privileged proxy administrator. Upgradeability is a trust assumption, not by itself a confirmed vulnerability.",
    recommendation: "Verify the current implementation and proxy administrator, review upgrade events, and monitor implementation changes and administrative key controls.",
    evidence: "Circle's published source defines FiatTokenProxy as an AdminUpgradeabilityProxy and documents upgrade administration."
  },
  {
    id: "I-05", projectId: 2, severity: "Informational",
    title: "Legacy Solidity Compiler Version", status: "Open",
    description: "The reviewed FiatTokenV2_2 source declares Solidity 0.6.12. This is a legacy compiler version, but the version alone does not demonstrate an exploitable defect in the deployed token.",
    recommendation: "Record the compiler version as a maintenance consideration and validate build reproducibility against the verified deployed source. Any compiler migration should include compatibility and regression testing.",
    evidence: "The reviewed FiatTokenV2_2 source contains pragma solidity 0.6.12."
  },
];