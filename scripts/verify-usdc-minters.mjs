/**
 * Read-only USDC minter history audit for Arbitrum One.
 *
 * Run from repository root with Node 22+:
 *   node --env-file=.env scripts/verify-usdc-minters.mjs
 *
 * Optional:
 *   START_BLOCK=100000000
 *   CHUNK_SIZE=5000 (Etherscan Logs API supports up to 5000 blocks per request)
 *
 * The scan is bounded by START_BLOCK and the current chain tip. For complete
 * history, START_BLOCK must be set to the verified proxy deployment block.
 * This script never submits transactions.
 */
import { ethers } from "ethers";

const API_KEY = process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY;
const API_URL = "https://api.etherscan.io/v2/api";
const TOKEN = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const EXPECTED_IMPLEMENTATION = "0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3";
const START_BLOCK = Number(process.env.START_BLOCK || 100000000);
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 5000);
const RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const provider = new ethers.JsonRpcProvider(RPC_URL, 42161, { staticNetwork: true });

const ABI = [
  "function implementation() view returns (address)",
  "function masterMinter() view returns (address)",
  "function paused() view returns (bool)",
  "function isMinter(address account) view returns (bool)",
  "function minterAllowance(address minter) view returns (uint256)"
];
const CONFIGURED_TOPIC = ethers.id("MinterConfigured(address,uint256)");
const REMOVED_TOPIC = ethers.id("MinterRemoved(address)");

async function getLogs(fromBlock, toBlock, topic) {
  const url = new URL(API_URL);
  for (const [key, value] of Object.entries({
    chainid: "42161",
    module: "logs",
    action: "getLogs",
    address: TOKEN,
    fromBlock: String(fromBlock),
    toBlock: String(toBlock),
    topic0: topic,
    page: "1",
    offset: "1000",
    apikey: API_KEY
  })) url.searchParams.set(key, value);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Etherscan HTTP ${response.status} for blocks ${fromBlock}-${toBlock}`);
  const body = await response.json();
  if (body.status === "1" && Array.isArray(body.result)) return body.result;
  if (body.status === "0" && /no records found/i.test(String(body.result))) return [];
  throw new Error(`Etherscan Logs API error for blocks ${fromBlock}-${toBlock}: ${body.result || body.message || "Unknown error"}`);
}

function rememberEvent(seen, log, eventName) {
  const address = ethers.getAddress("0x" + log.topics[1].slice(-40));
  const key = address.toLowerCase();
  const entry = seen.get(key) || {
    address, configuredEventCount: 0, removedEventCount: 0,
    lastObservedEvent: null, lastObservedBlock: 0, lastObservedTransaction: null
  };
  if (eventName === "MinterConfigured") entry.configuredEventCount++;
  else entry.removedEventCount++;
  const block = Number(BigInt(log.blockNumber));
  if (block >= entry.lastObservedBlock) {
    entry.lastObservedBlock = block;
    entry.lastObservedEvent = eventName;
    entry.lastObservedTransaction = log.transactionHash;
  }
  seen.set(key, entry);
}

async function main() {
  if (!API_KEY) throw new Error("Missing API key. Set ARBISCAN_API_KEY in .env; do not commit or share that file.");
  if (!Number.isSafeInteger(START_BLOCK) || START_BLOCK < 0) throw new Error("START_BLOCK must be a non-negative integer.");
  if (!Number.isSafeInteger(CHUNK_SIZE) || CHUNK_SIZE < 1 || CHUNK_SIZE > 5000) throw new Error("CHUNK_SIZE must be between 1 and 5000.");

  const [chainIdHex, latestHex] = await Promise.all([
    provider.send("eth_chainId", []), provider.send("eth_blockNumber", [])
  ]);
  const chainId = Number(BigInt(chainIdHex));
  const latestBlock = Number(BigInt(latestHex));
  if (chainId !== 42161) throw new Error(`Wrong RPC chain ID: ${chainId}`);
  if (START_BLOCK > latestBlock) throw new Error("START_BLOCK is newer than the current chain tip.");

  const token = new ethers.Contract(TOKEN, ABI, provider);
  const [implementation, masterMinter, paused] = await Promise.all([
    token.implementation(), token.masterMinter(), token.paused()
  ]);

  const seen = new Map();
  let configuredEvents = 0;
  let removedEvents = 0;
  let scannedBlocks = 0;
  const totalChunks = Math.ceil((latestBlock - START_BLOCK + 1) / CHUNK_SIZE);

  for (let fromBlock = START_BLOCK, chunk = 0; fromBlock <= latestBlock; fromBlock += CHUNK_SIZE, chunk++) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, latestBlock);
    // Separate topic queries respect the explorer's indexed Logs API contract.
    const [configured, removed] = await Promise.all([
      getLogs(fromBlock, toBlock, CONFIGURED_TOPIC),
      getLogs(fromBlock, toBlock, REMOVED_TOPIC)
    ]);
    for (const log of configured) rememberEvent(seen, log, "MinterConfigured");
    for (const log of removed) rememberEvent(seen, log, "MinterRemoved");
    configuredEvents += configured.length;
    removedEvents += removed.length;
    scannedBlocks += toBlock - fromBlock + 1;

    if (chunk % 20 === 0 || toBlock === latestBlock) {
      console.error(`Chunk ${chunk + 1}/${totalChunks}: through block ${toBlock}; ${seen.size} unique addresses observed.`);
    }
    // Gentle pacing for free-tier API limits.
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  const observedMinters = [];
  for (const entry of seen.values()) {
    const [currentlyAuthorized, allowance] = await Promise.all([
      token.isMinter(entry.address), token.minterAllowance(entry.address)
    ]);
    observedMinters.push({
      ...entry,
      currentlyAuthorized,
      remainingAllowanceRaw: allowance.toString(),
      remainingAllowanceUSDC: ethers.formatUnits(allowance, 6)
    });
  }
  observedMinters.sort((a, b) => Number(b.currentlyAuthorized) - Number(a.currentlyAuthorized)
    || b.lastObservedBlock - a.lastObservedBlock);

  console.log(JSON.stringify({
    network: "Arbitrum One", chainId, token: TOKEN,
    startBlock: START_BLOCK, endBlock: latestBlock,
    checkedAt: new Date().toISOString(), scannedBlocks,
    scanIsCompleteFromDeployment: false,
    implementation,
    expectedImplementation: EXPECTED_IMPLEMENTATION,
    implementationMatchesExpected: implementation.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase(),
    masterMinter, paused, configuredEvents, removedEvents,
    uniqueMinterAddressesObserved: seen.size,
    currentAuthorizedMinterCountInObservedHistory: observedMinters.filter(x => x.currentlyAuthorized).length,
    observedMinters,
    limitations: [
      "Only events from START_BLOCK through endBlock were scanned.",
      "Set START_BLOCK to the verified proxy deployment block for full event-history coverage.",
      "An address configured before START_BLOCK and never reconfigured afterward will not be discovered.",
      "The Etherscan Logs API returns at most 1000 results per request; if a 5000-block chunk reaches that limit, narrow CHUNK_SIZE and rerun.",
      "Read-only state snapshot; no transactions are sent and this is not proof of absence of vulnerabilities."
    ]
  }, null, 2));

  if (implementation.toLowerCase() !== EXPECTED_IMPLEMENTATION.toLowerCase()) process.exitCode = 2;
}

main().catch(error => {
  console.error("Read-only USDC minter audit failed:", error.message || error);
  process.exitCode = 1;
});
