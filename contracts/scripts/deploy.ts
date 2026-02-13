import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("ClawShieldRegistry");
  const contract = await factory.deploy(deployer.address);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("ClawShieldRegistry deployed");
  console.log("network:", (await ethers.provider.getNetwork()).name);
  console.log("deployer:", deployer.address);
  console.log("contract:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
