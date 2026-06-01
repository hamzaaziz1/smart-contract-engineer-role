import { ethers } from "hardhat";

async function main() {
  const useReference = process.env.DEPLOY_REFERENCE === "1";
  const contractName = useReference ? "QuestEscrowReference" : "QuestEscrow";
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ${contractName} as`, deployer.address);

  const Escrow = await ethers.getContractFactory(contractName);
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Mock USDC", "mUSDC");
  await usdc.waitForDeployment();

  console.log("\n=== Add to .env.local (repo root) ===");
  console.log(`NEXT_PUBLIC_QUEST_ESCROW_ADDRESS=${await escrow.getAddress()}`);
  console.log(`NEXT_PUBLIC_MOCK_USDC_ADDRESS=${await usdc.getAddress()}`);
  console.log("NEXT_PUBLIC_CHAIN_ID=31337");
  console.log("NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
