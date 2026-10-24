/**
 * Read-only USDC minter history audit for Arbitrum One.
 *
 * Run from repository root with Node 22+:
 *   node --env-file=.env scripts/verify-usdc-minters.mjs
 *
 * Optional:
 *   RECENT_BLOCK_WINDOW=100000 (default scan window when START_BLOCK is omitted)
 *   START_BLOCK=...           (explicit start; scans from there to the current tip)
 *   CHUNK_SIZE=5000           (maximum initial chunk; API results are split if capped)
 *
 * By default, this scans only a recent window, not the complete deployment history.
 * For complete history, START_BLOCK must be set to the verified proxy deployment
 * block. This script never submits transactions.
 */
import { ethers } from "ethers";

const API_KEY = process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY;
const API_URL = "https://api.etherscan.io/v2/api";
const TOKEN = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const EXPECTED_IMPLEMENTATION = "0x86E721b43D4ecFA71119dd38c0F938A75FDB57B3";
const START_BLOCK_ENV = process.env.START_BLOCK;
const RECENT_BLOCK_WINDOW = Number(process.env.RECENT_BLOCK_WINDOW || 100000);
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 5000);
const API_DELAY_MS = 350;
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getLogsOnce(fromBlock, toBlock, topic) {
  const url = new URL(API_URL);
  for (const [key, value] of Object.entries({
    chainid: "42161", module: "logs", action: "getLogs", address: TOKEN,
    fromBlock: String(fromBlock), toBlock: String(toBlock), topic0: topic,
    page: "1", offset: "1000", apikey: API_KEY
  })) url.searchParams.set(key, value);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Etherscan HTTP ${response.status} for blocks ${fromBlock}-${toBlock}`);
  const body = await response.json();
  if (body.status === "1" && Array.isArray(body.result)) return body.result;
  if (body.status === "0" && /no records found/i.test(String(body.result))) return [];
  throw new Error(`Etherscan Logs API error for blocks ${fromBlock}-${toBlock}: ${body.result || body.message || "Unknown error"}`);
}

async function getLogs(fromBlock, toBlock, topic) {
  await sleep(API_DELAY_MS);
  const logs = await getLogsOnce(fromBlock, toBlock, topic);

  // Etherscan caps a query at 1000 results. Split saturated ranges to avoid
  // silently treating a truncated response as complete.
  if (logs.length >= 1000) {
    if (fromBlock === toBlock) {
      throw new Error(`At least 1000 matching events in block ${fromBlock}; cannot safely page this single-block range.`);
    }
    const midpoint = Math.floor((fromBlock + toBlock) / 2);
    console.error(`API result cap reached for blocks ${fromBlock}-${toBlock}; splitting range.`);
    const left = await getLogs(fromBlock, midpoint, topic);
    const right = await getLogs(midpoint + 1, toBlock, topic);
    return left.concat(right);
  }
  return logs;
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
  if (START_BLOCK_ENV !== undefined && (!/^\d+$/.test(START_BLOCK_ENV) || !Number.isSafeInteger(Number(START_BLOCK_ENV)))) {
    throw new Error("START_BLOCK must be a non-negative integer.");
  }
  if (!Number.isSafeInteger(RECENT_BLOCK_WINDOW) || RECENT_BLOCK_WINDOW < 1) {
    throw new Error("RECENT_BLOCK_WINDOW must be a positive integer.");
  }
  if (!Number.isSafeInteger(CHUNK_SIZE) || CHUNK_SIZE < 1 || CHUNK_SIZE > 5000) {
    throw new Error("CHUNK_SIZE must be between 1 and 5000.");
  }

  const [chainIdHex, latestHex] = await Promise.all([
    provider.send("eth_chainId", []), provider.send("eth_blockNumber", [])
  ]);
  const chainId = Number(BigInt(chainIdHex));
  const latestBlock = Number(BigInt(latestHex));
  if (chainId !== 42161) throw new Error(`Wrong RPC chain ID: ${chainId}`);

  const isFullStartExplicit = START_BLOCK_ENV !== undefined;
  const startBlock = isFullStartExplicit
    ? Number(START_BLOCK_ENV)
    : Math.max(0, latestBlock - RECENT_BLOCK_WINDOW + 1);
  if (startBlock > latestBlock) throw new Error("START_BLOCK is newer than the current chain tip.");

  const token = new ethers.Contract(TOKEN, ABI, provider);
  const [implementation, masterMinter, paused] = await Promise.all([
    token.implementation(), token.masterMinter(), token.paused()
  ]);

  const seen = new Map();
  let configuredEvents = 0;
  let removedEvents = 0;
  let scannedBlocks = 0;
  const totalChunks = Math.ceil((latestBlock - startBlock + 1) / CHUNK_SIZE);

  for (let fromBlock = startBlock, chunk = 0; fromBlock <= latestBlock; fromBlock += CHUNK_SIZE, chunk++) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, latestBlock);
    const [configured, removed] = await Promise.all([
      getLogs(fromBlock, toBlock, CONFIGURED_TOPIC),
      getLogs(fromBlock, toBlock, REMOVED_TOPIC)
    ]);
    for (const log of configured) rememberEvent(seen, log, "MinterConfigured");
    for (const log of removed) rememberEvent(seen, log, "MinterRemoved");
    configuredEvents += configured.length;
    removedEvents += removed.length;
    scannedBlocks += toBlock - fromBlock + 1;

    if (chunk % 10 === 0 || toBlock === latestBlock) {
      console.error(`Chunk ${chunk + 1}/${totalChunks}: through block ${toBlock}; ${seen.size} unique addresses observed.`);
    }
  }

  const observedMinters = [];
  for (const entry of seen.values()) {
    const [currentlyAuthorized, allowance] = await Promise.all([
      token.isMinter(entry.address), token.minterAllowance(entry.address)
    ]);
    observedMinters.push({
      ...entry, currentlyAuthorized,
      remainingAllowanceRaw: allowance.toString(),
      remainingAllowanceUSDC: ethers.formatUnits(allowance, 6)
    });
  }
  observedMinters.sort((a, b) => Number(b.currentlyAuthorized) - Number(a.currentlyAuthorized)
    || b.lastObservedBlock - a.lastObservedBlock);

  console.log(JSON.stringify({
    network: "Arbitrum One", chainId, token: TOKEN,
    scanRangeMode: isFullStartExplicit ? "explicit-start-block" : "recent-window",
    startBlock, endBlock: latestBlock, checkedAt: new Date().toISOString(), scannedBlocks,
    scanIsCompleteFromDeployment: false,
    implementation, expectedImplementation: EXPECTED_IMPLEMENTATION,
    implementationMatchesExpected: implementation.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase(),
    masterMinter, paused, configuredEvents, removedEvents,
    uniqueMinterAddressesObserved: seen.size,
    currentAuthorizedMinterCountInObservedHistory: observedMinters.filter(x => x.currentlyAuthorized).length,
    observedMinters,
    limitations: [
      isFullStartExplicit
        ? "An explicit start block was supplied; completeness depends on using the verified proxy deployment block."
        : "Default scan covers only the most recent RECENT_BLOCK_WINDOW blocks, not the complete deployment history.",
      "An address configured before the scan start and never reconfigured afterward will not be discovered.",
      "Ranges returning 1000 or more logs are recursively split to avoid silently accepting the API result cap.",
      "Current authorization and allowance are queried at the current chain tip, while events describe the selected historical range.",
      "Read-only state snapshot; no transactions are sent and this is not proof of absence of vulnerabilities."
    ]
  }, null, 2));

  if (implementation.toLowerCase() !== EXPECTED_IMPLEMENTATION.toLowerCase()) process.exitCode = 2;
}

main().catch(error => {
  console.error("Read-only USDC minter audit failed:", error.message || error);
  process.exitCode = 1;
});
