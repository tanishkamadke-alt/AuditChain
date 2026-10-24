/**
 * Read-only verification of native USDC privileged controls on Arbitrum One.
 * Run from the repository root after installing ethers:
 *   npm install --no-save ethers
 *   node scripts/verify-usdc-roles.mjs
 *
 * This script sends only eth_chainId, eth_blockNumber, eth_call and
 * eth_getStorageAt requests. It never submits a transaction.
 */
import { ethers } from "ethers";

const RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const PROXY = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const EXPECTED_IMPLEMENTATION = "0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3";
const provider = new ethers.JsonRpcProvider(RPC_URL, 42161, { staticNetwork: true });

const ABI = [
  "function owner() view returns (address)",
  "function masterMinter() view returns (address)",
  "function pauser() view returns (address)",
  "function blacklister() view returns (address)",
  "function rescuer() view returns (address)",
  "function paused() view returns (bool)"
];
const contract = new ethers.Contract(PROXY, ABI, provider);

// EIP-1967 slots: bytes32(uint256(keccak256(label)) - 1)
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e0190000000000000000000000000000";

function addressFromStorage(word) {
  return ethers.getAddress("0x" + word.slice(-40));
}

async function main() {
  const [chainIdHex, blockHex] = await Promise.all([
    provider.send("eth_chainId", []),
    provider.send("eth_blockNumber", [])
  ]);
  const chainId = Number(BigInt(chainIdHex));
  if (chainId !== 42161) throw new Error(`Wrong chain ID: ${chainId}`);

  const [implementationWord, adminWord] = await Promise.all([
    provider.send("eth_getStorageAt", [PROXY, IMPLEMENTATION_SLOT, "latest"]),
    provider.send("eth_getStorageAt", [PROXY, ADMIN_SLOT, "latest"])
  ]);

  const roles = {};
  for (const method of ["owner", "masterMinter", "pauser", "blacklister", "rescuer", "paused"]) {
    try {
      roles[method] = await contract[method]();
    } catch (error) {
      roles[method] = { error: String(error.shortMessage || error.message || error) };
    }
  }

  const implementation = addressFromStorage(implementationWord);
  const proxyAdmin = addressFromStorage(adminWord);
  const result = {
    network: "Arbitrum One",
    chainId,
    blockNumber: Number(BigInt(blockHex)),
    checkedAt: new Date().toISOString(),
    proxy: PROXY,
    implementation,
    expectedImplementation: EXPECTED_IMPLEMENTATION,
    implementationMatchesExpected: implementation.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase(),
    proxyAdmin,
    roles,
    note: "Read-only snapshot. Role addresses and paused state can change; retain the block number and timestamp with audit evidence."
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.implementationMatchesExpected) process.exitCode = 2;
}

main().catch((error) => {
  console.error("Read-only USDC role verification failed:", error.shortMessage || error.message || error);
  process.exitCode = 1;
});
