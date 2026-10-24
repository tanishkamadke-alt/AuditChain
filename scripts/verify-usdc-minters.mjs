/**
 * Read-only minter history and current-state audit for native USDC on Arbitrum One.
 *
 * Run from repository root:
 *   node scripts/verify-usdc-minters.mjs
 *
 * Optional environment variables:
 *   START_BLOCK=100000000  (default is a bounded historical scan; set to the
 *                           verified deployment block for complete history)
 *   CHUNK_SIZE=1000000     (blocks per eth_getLogs request; lower it if RPC rejects the range)
 *   ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
 *
 * This script scans MinterConfigured and MinterRemoved events, then queries
 * current isMinter/ minterAllowance state for every address observed.
 * It is read-only and never submits transactions.
 *
 * IMPORTANT: The default START_BLOCK is intentionally configurable and is not
 * asserted to be the token's deployment block. For a complete audit, set
 * START_BLOCK to the verified deployment block shown by Arbiscan.
 */
import { ethers } from "ethers";

const RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const TOKEN = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const EXPECTED_IMPLEMENTATION = "0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3";
const START_BLOCK = Number(process.env.START_BLOCK || 100000000);
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 1000000);
const provider = new ethers.JsonRpcProvider(RPC_URL, 42161, { staticNetwork: true });

const ABI = [
  "function implementation() view returns (address)",
  "function masterMinter() view returns (address)",
  "function paused() view returns (bool)",
  "function isMinter(address account) view returns (bool)",
  "function minterAllowance(address minter) view returns (uint256)",
  "event MinterConfigured(address indexed minter, uint256 minterAllowedAmount)",
  "event MinterRemoved(address indexed oldMinter)"
];

async function main() {
  if (!Number.isSafeInteger(START_BLOCK) || START_BLOCK < 0) {
    throw new Error("START_BLOCK must be a non-negative integer");
  }
  if (!Number.isSafeInteger(CHUNK_SIZE) || CHUNK_SIZE < 1) {
    throw new Error("CHUNK_SIZE must be a positive integer");
  }

  const [chainIdHex, latestHex] = await Promise.all([
    provider.send("eth_chainId", []),
    provider.send("eth_blockNumber", [])
  ]);
  const chainId = Number(BigInt(chainIdHex));
  const latestBlock = Number(BigInt(latestHex));
  if (chainId !== 42161) throw new Error(`Wrong chain ID: ${chainId}`);
  if (START_BLOCK > latestBlock) throw new Error("START_BLOCK is newer than the current chain tip");

  const token = new ethers.Contract(TOKEN, ABI, provider);
  const [implementation, masterMinter, paused] = await Promise.all([
    token.implementation(),
    token.masterMinter(),
    token.paused()
  ]);

  const configuredTopic = ethers.id("MinterConfigured(address,uint256)");
  const removedTopic = ethers.id("MinterRemoved(address)");
  const seen = new Map();
  let configuredEvents = 0;
  let removedEvents = 0;
  let scannedBlocks = 0;

  // Chunked scanning avoids requesting the entire chain's log history at once.
  for (let fromBlock = START_BLOCK; fromBlock <= latestBlock; fromBlock += CHUNK_SIZE) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, latestBlock);
    const logs = await provider.send("eth_getLogs", [{
      address: TOKEN,
      fromBlock: ethers.toQuantity(fromBlock),
      toBlock: ethers.toQuantity(toBlock),
      topics: [[configuredTopic, removedTopic]]
    }]);

    for (const log of logs) {
      const topic = log.topics[0].toLowerCase();
      const address = ethers.getAddress("0x" + log.topics[1].slice(-40));
      const prior = seen.get(address.toLowerCase()) || {
        address,
        configuredEventCount: 0,
        removedEventCount: 0,
        lastObservedEvent: null,
        lastObservedBlock: 0
      };
      if (topic === configuredTopic.toLowerCase()) {
        configuredEvents += 1;
        prior.configuredEventCount += 1;
        prior.lastObservedEvent = "MinterConfigured";
      } else {
        removedEvents += 1;
        prior.removedEventCount += 1;
        prior.lastObservedEvent = "MinterRemoved";
      }
      prior.lastObservedBlock = Number(BigInt(log.blockNumber));
      prior.lastObservedTransaction = log.transactionHash;
      seen.set(address.toLowerCase(), prior);
    }
    scannedBlocks += toBlock - fromBlock + 1;
    if ((fromBlock - START_BLOCK) % (CHUNK_SIZE * 20) === 0) {
      console.error(`Scanned through block ${toBlock}; observed ${seen.size} unique minter addresses.`);
    }
  }

  const currentMinters = [];
  for (const entry of seen.values()) {
    const [isMinter, allowance] = await Promise.all([
      token.isMinter(entry.address),
      token.minterAllowance(entry.address)
    ]);
    currentMinters.push({
      ...entry,
      currentlyAuthorized: isMinter,
      remainingAllowanceRaw: allowance.toString(),
      remainingAllowanceUSDC: ethers.formatUnits(allowance, 6)
    });
  }
  currentMinters.sort((a, b) => Number(b.currentlyAuthorized) - Number(a.currentlyAuthorized)
    || b.lastObservedBlock - a.lastObservedBlock);

  console.log(JSON.stringify({
    network: "Arbitrum One",
    chainId,
    startBlock: START_BLOCK,
    endBlock: latestBlock,
    checkedAt: new Date().toISOString(),
    scannedBlocks,
    scanIsCompleteFromDeployment: false,
    token: TOKEN,
    implementation,
    expectedImplementation: EXPECTED_IMPLEMENTATION,
    implementationMatchesExpected: implementation.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase(),
    masterMinter,
    paused,
    configuredEvents,
    removedEvents,
    uniqueMinterAddressesObserved: seen.size,
    currentAuthorizedMinterCountInObservedHistory: currentMinters.filter(x => x.currentlyAuthorized).length,
    observedMinters: currentMinters,
    limitations: [
      "The scan only covers START_BLOCK through the reported end block.",
      "The default START_BLOCK is a bounded starting point, not a verified deployment block; set START_BLOCK to the verified deployment block for complete history.",
      "Addresses that were configured before START_BLOCK and had no later configuration/removal event will not be discovered by this scan.",
      "Event history and current state are evidence for this snapshot, not proof that the contract has no vulnerabilities.",
      "Read-only RPC calls only; no transactions are sent."
    ]
  }, null, 2));

  if (implementation.toLowerCase() !== EXPECTED_IMPLEMENTATION.toLowerCase()) {
    process.exitCode = 2;
  }
}

main().catch(error => {
  console.error("Read-only USDC minter audit failed:", error.shortMessage || error.message || error);
  process.exitCode = 1;
});
