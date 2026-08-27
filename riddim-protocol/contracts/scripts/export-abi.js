const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Compiles and writes the ABI to ../lib/onchain/abi.json so the app can stay in
// sync with the contract without depending on the Hardhat build output.
async function main() {
  await hre.run("compile");
  const artifact = await hre.artifacts.readArtifact("RiddimRegistry");
  const outPath = path.join(__dirname, "..", "..", "lib", "onchain", "abi.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2) + "\n");
  console.log(`Wrote ABI (${artifact.abi.length} entries) to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
