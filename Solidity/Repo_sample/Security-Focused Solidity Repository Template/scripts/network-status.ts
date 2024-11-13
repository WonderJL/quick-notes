// scripts/network-status.ts
import { ethers } from "hardhat";
import { formatEther } from "ethers/lib/utils";

async function main() {
  console.log("\nNetwork Status Check");
  console.log("==================");

  // Get network
  const network = await ethers.provider.getNetwork();
  console.log(`\nNetwork: ${network.name} (chainId: ${network.chainId})`);

  // Get block number
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Current block: ${blockNumber}`);

  // Get gas price
  const gasPrice = await ethers.provider.getGasPrice();
  console.log(`Gas price: ${formatEther(gasPrice)} ETH`);

  // Get accounts
  const accounts = await ethers.getSigners();
  console.log("\nAccounts:");

  for (const account of accounts) {
    const balance = await account.getBalance();
    console.log(`${account.address}: ${formatEther(balance)} ETH`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
