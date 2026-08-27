const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys RiddimRegistry and, on success, writes the address + ABI to
// ../lib/onchain/deployment.json so the Next.js app picks it up automatically.
async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "No deployer account. Set PRIVATE_KEY in contracts/.env (a funded HSK-testnet key).",
    );
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Network:  ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} (native)`);

  if (balance === 0n) {
    console.warn(
      "\n⚠️  Deployer balance is 0. Fund it first (HSK Testnet faucet: https://faucet.hsk.xyz).\n",
    );
  }

  const Registry = await hre.ethers.getContractFactory("RiddimRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  const explorer =
    network === "hskTestnet"
      ? `https://testnet-explorer.hsk.xyz/address/${address}`
      : `(explorer for ${network})`;

  console.log(`\n✅ RiddimRegistry deployed to: ${address}`);
  console.log(`   Explorer: ${explorer}`);

  // Write deployment metadata for the app to consume.
  const artifact = await hre.artifacts.readArtifact("RiddimRegistry");
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const out = {
    address,
    chainId,
    network,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };
  const outPath = path.join(__dirname, "..", "..", "lib", "onchain", "deployment.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`   Wrote ${outPath}`);
  console.log(
    `\nNext: set NEXT_PUBLIC_CONTRACT_ADDRESS=${address} in riddim-protocol/.env and restart the app.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
