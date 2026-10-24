/**
 * One-command read-only verification bundle for AuditChain Project 2 (native USDC on Arbitrum One).
 *
 * Run from repository root with Node 22+ and dependencies installed:
 *   node --env-file=.env scripts/verify-usdc-project2.mjs
 *
 * Runs role, minting-state, and minter-event checks serially, then writes a local JSON evidence bundle.
 * It never submits transactions. The minter history is only as complete as the configured scan range.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "audit-results");
const SCRIPTS = [
  ["roles", "scripts/verify-usdc-roles.mjs"],
  ["minting", "scripts/verify-usdc-minting.mjs"],
  ["minterHistory", "scripts/verify-usdc-minters.mjs"],
];

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.on("error", reject);
    child.on("close", code => {
      if (code !== 0) {
        reject(new Error(`${scriptPath} exited with code ${code}. See the error above; no combined report was written.`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`${scriptPath} completed but did not emit valid JSON on stdout.`));
      }
    });
  });
}

async function main() {
  const evidence = {
    auditName: "AuditChain Project 2 — Native USDC on Arbitrum One",
    generatedAt: new Date().toISOString(),
    network: "Arbitrum One",
    chainId: 42161,
    readOnly: true,
    checks: {},
    limitations: [
      "Role and minting fields are point-in-time snapshots; state may change after the recorded block.",
      "Minter history completeness depends on START_BLOCK. Without START_BLOCK set to the independently verified proxy deployment block, the minter script scans only RECENT_BLOCK_WINDOW blocks.",
      "This verification bundle is not proof that the contract is free of vulnerabilities and does not replace manual review, testing, or independent verification."
    ]
  };

  for (const [name, scriptPath] of SCRIPTS) {
    console.error(`\n=== Running ${name}: ${scriptPath} ===`);
    evidence.checks[name] = await runScript(scriptPath);
  }

  const implementationMatches = [
    evidence.checks.roles.implementationMatchesExpected,
    evidence.checks.minting.implementationMatchesExpected,
    evidence.checks.minterHistory.implementationMatchesExpected,
  ].every(Boolean);
  evidence.summary = {
    implementationMatchesExpected: implementationMatches,
    tokenPaused: evidence.checks.minting.paused,
    minterHistoryMode: evidence.checks.minterHistory.scanRangeMode,
    minterHistoryStartBlock: evidence.checks.minterHistory.startBlock,
    minterHistoryEndBlock: evidence.checks.minterHistory.endBlock,
    minterHistoryCompleteFromDeployment: evidence.checks.minterHistory.scanIsCompleteFromDeployment === true
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `project2-usdc-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  await writeFile(outputPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({
    result: "SUCCESS",
    outputFile: path.relative(ROOT, outputPath),
    summary: evidence.summary,
    note: "The evidence bundle is local and ignored by Git. Review the minter-history limitations before describing the audit as complete."
  }, null, 2));
}

main().catch(error => {
  console.error("Project 2 verification bundle failed:", error.message || error);
  process.exitCode = 1;
});
