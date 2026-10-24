/**
 * Read-only checks for native USDC minting controls on Arbitrum One.
 *
 * Run from repository root:
 *   npm install --no-save ethers
 *   node scripts/verify-usdc-minting.mjs
 *
 * Optional: set MINTER_ADDRESS to inspect a specific candidate minter:
 *   $env:MINTER_ADDRESS="0x..."
 *   node scripts/verify-usdc-minting.mjs
 *
 * This script makes read-only RPC calls and never submits transactions.
 */
import { ethers } from "ethers";

const RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const TOKEN = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const EXPECTED_IMPLEMENTATION = "0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3";
const candidateMinter = process.env.MINTER_ADDRESS || null;
const provider = new ethers.JsonRpcProvider(RPC_URL, 42161, { staticNetwork: true });

const ABI = [
  "function implementation() view returns (address)",
  "function masterMinter() view returns (address)",
  "function paused() view returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function isMinter(address account) view returns (bool)",
  "function minterAllowance(address minter) view returns (uint256)"
];

async function main() {
  const [chainIdHex, blockHex] = await Promise.all([
    provider.send("eth_chainId", []),
    provider.send("eth_blockNumber", [])
  ]);
  const chainId = Number(BigInt(chainIdHex));
  if (chainId !== 42161) throw new Error(`Wrong chain ID: ${chainId}`);

  const token = new ethers.Contract(TOKEN, ABI, provider);
  const [implementation, masterMinter, paused, totalSupply] = await Promise.all([
    token.implementation(),
    token.masterMinter(),
    token.paused(),
    token.totalSupply()
  ]);

  let minterCheck = null;
  if (candidateMinter) {
    if (!ethers.isAddress(candidateMinter)) {
      throw new Error("MINTER_ADDRESS is not a valid EVM address");
    }
    const [isMinter, allowance] = await Promise.all([
      token.isMinter(candidateMinter),
      token.minterAllowance(candidateMinter)
    ]);
    minterCheck = {
      address: ethers.getAddress(candidateMinter),
      isAuthorizedMinter: isMinter,
      remainingAllowanceRaw: allowance.toString(),
      remainingAllowanceUSDC: ethers.formatUnits(allowance, 6)
    };
  }

  console.log(JSON.stringify({
    network: "Arbitrum One",
    chainId,
    blockNumber: Number(BigInt(blockHex)),
    checkedAt: new Date().toISOString(),
    token: TOKEN,
    implementation,
    expectedImplementation: EXPECTED_IMPLEMENTATION,
    implementationMatchesExpected: implementation.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase(),
    masterMinter,
    paused,
    totalSupplyRaw: totalSupply.toString(),
    totalSupplyUSDC: ethers.formatUnits(totalSupply, 6),
    candidateMinterCheck: minterCheck,
    limitations: [
      "Read-only snapshot; values may change after this block.",
      "Without MINTER_ADDRESS, this script does not enumerate all minters.",
      "A minter's remaining allowance is not a global supply cap; authorized allowances may be changed by the master minter."
    ]
  }, null, 2));

  if (implementation.toLowerCase() !== EXPECTED_IMPLEMENTATION.toLowerCase()) {
    process.exitCode = 2;
  }
}

main().catch(error => {
  console.error("Read-only USDC minting verification failed:", error.shortMessage || error.message || error);
  process.exitCode = 1;
});
