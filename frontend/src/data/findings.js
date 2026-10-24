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
];