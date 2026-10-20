const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Registry = await hre.ethers.getContractFactory(
    "CertificateRegistry"
  );

  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log("CertificateRegistry deployed at:", address);

  fs.writeFileSync(
    path.join(__dirname, "../frontend/contract-address.json"),
    JSON.stringify({ address }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
