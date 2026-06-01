import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/** Run: cd contracts && npx hardhat test test/QuestEscrow.assessment.test.ts */

const ASSESSMENT_CONTRACT =
  process.env.QUEST_ASSESSMENT_SOLUTION === "1" ? "QuestEscrowReference" : "QuestEscrow";

describe("ChainQuest escrow (assessment scenarios)", function () {
  let escrow: any;
  let usdc: any;
  let owner: any;
  let client: any;
  let freelancer: any;
  let other: any;

  async function deployFixture() {
    [owner, client, freelancer, other] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory(ASSESSMENT_CONTRACT);
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "mUSDC");
    await usdc.waitForDeployment();

    return { escrow, usdc };
  }

  beforeEach(async function () {
    await deployFixture();
  });

  it("Scenario A: ETH quest — accept, submit, approve, worker paid net of 3% fee", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("1");

    await escrow.connect(client).createQuest(
      "Integrate wallet connect",
      "Wire RainbowKit on the dashboard",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow
      .connect(freelancer)
      .submitWork(questId, "ipfs://QmExampleDeliverable");

    const workerBefore = await ethers.provider.getBalance(freelancer.address);
    await escrow.connect(client).approveAndPay(questId);

    const workerAfter = await ethers.provider.getBalance(freelancer.address);
    const expectedPayout = (reward * 9700n) / 10000n;
    expect(workerAfter - workerBefore).to.equal(expectedPayout);

    const q = await escrow.getQuest(questId);
    expect(q.status).to.equal(3); // Completed
  });

  it("Scenario B: platform owner withdraws accumulated ETH fees", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("2");

    await escrow.connect(client).createQuest(
      "Audit subgraph",
      "Review indexing handlers",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow.connect(freelancer).submitWork(questId, "ipfs://audit-report");
    await escrow.connect(client).approveAndPay(questId);

    const fees = await escrow.getAvailableFees(ethers.ZeroAddress);
    expect(fees).to.equal((reward * 300n) / 10000n);

    const ownerBefore = await ethers.provider.getBalance(owner.address);
    const wd = await escrow.connect(owner).withdrawFees(ethers.ZeroAddress);
    const wdReceipt = await wd.wait();
    const ownerAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerAfter + wdReceipt!.gasUsed * wdReceipt!.gasPrice).to.be.gt(ownerBefore);
  });

  it("Scenario C: worker cannot accept after acceptDeadline", async function () {
    const acceptDeadline = (await time.latest()) + 100;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("0.5");

    await escrow.connect(client).createQuest(
      "Late quest",
      "Should not be accept-able",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    await time.increaseTo(acceptDeadline + 1);
    await expect(escrow.connect(freelancer).acceptQuest(1)).to.be.revertedWith(
      "Acceptance closed"
    );
  });

  it("Scenario D: only the poster may approve and pay", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("0.25");

    await escrow.connect(client).createQuest(
      "Access control",
      "Poster-only approval",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow.connect(freelancer).submitWork(questId, "ipfs://work");

    await expect(escrow.connect(other).approveAndPay(questId)).to.be.revertedWith(
      "Only poster"
    );
  });

  it("Scenario E: cannot approve before work is submitted", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("0.1");

    await escrow.connect(client).createQuest(
      "Premature approval",
      "Must submit first",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);

    await expect(escrow.connect(client).approveAndPay(questId)).to.be.revertedWith(
      "Not submitted"
    );
  });

  it("Scenario F: ERC20-funded quest completes with fee accounting", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 7200;
    const reward = ethers.parseUnits("500", 6);

    await usdc.mint(client.address, reward);
    await usdc.connect(client).approve(await escrow.getAddress(), reward);

    await escrow.connect(client).createQuest(
      "USDC bounty",
      "Ship ERC20 payout path",
      reward,
      acceptDeadline,
      reviewPeriod,
      await usdc.getAddress()
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow.connect(freelancer).submitWork(questId, "ipfs://erc20-deliverable");
    await escrow.connect(client).approveAndPay(questId);

    const expectedPayout = (reward * 9700n) / 10000n;
    expect(await usdc.balanceOf(freelancer.address)).to.equal(expectedPayout);

    const tokenAddr = await usdc.getAddress();
    expect(await escrow.getAvailableFees(tokenAddr)).to.equal(
      (reward * 300n) / 10000n
    );
  });

  it("Scenario G: poster cancels an open quest and receives full refund", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 3600;
    const reward = ethers.parseEther("0.75");

    const clientBefore = await ethers.provider.getBalance(client.address);
    await escrow.connect(client).createQuest(
      "Cancelled gig",
      "No worker assigned",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const cancelTx = await escrow.connect(client).cancelQuest(1);
    const cancelReceipt = await cancelTx.wait();
    const cancelGas = cancelReceipt!.gasUsed * cancelReceipt!.gasPrice;

    const clientAfter = await ethers.provider.getBalance(client.address);
    expect(clientAfter + cancelGas - clientBefore).to.be.closeTo(0n, ethers.parseEther("0.001"));

    const q = await escrow.getQuest(1);
    expect(q.status).to.equal(4); // Cancelled
  });

  it("Scenario H: worker claims timeout payout when poster does not approve in time", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 1800;
    const reward = ethers.parseEther("1.5");

    await escrow.connect(client).createQuest(
      "Slow client",
      "Worker timeout claim",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow.connect(freelancer).submitWork(questId, "ipfs://timeout-work");

    const q = await escrow.getQuest(questId);
    await time.increaseTo(Number(q.reviewDeadline) + 1);

    const workerBefore = await ethers.provider.getBalance(freelancer.address);
    const tx = await escrow.connect(freelancer).claimTimeoutPayout(questId);
    const receipt = await tx.wait();
    const gasPaid = receipt!.fee ?? receipt!.gasUsed * receipt!.gasPrice;
    const workerAfter = await ethers.provider.getBalance(freelancer.address);

    const expectedPayout = (reward * 9700n) / 10000n;
    expect(workerAfter + gasPaid - workerBefore).to.equal(expectedPayout);
  });

  it("Scenario I: poster refunds after review window when deliverable is rejected implicitly", async function () {
    const acceptDeadline = (await time.latest()) + 86400;
    const reviewPeriod = 600;
    const reward = ethers.parseEther("0.4");

    await escrow.connect(client).createQuest(
      "Disputed delivery",
      "Poster refund path",
      reward,
      acceptDeadline,
      reviewPeriod,
      ethers.ZeroAddress,
      { value: reward }
    );

    const questId = 1n;
    await escrow.connect(freelancer).acceptQuest(questId);
    await escrow.connect(freelancer).submitWork(questId, "ipfs://bad-fit");

    const q = await escrow.getQuest(questId);
    await time.increaseTo(Number(q.reviewDeadline) + 1);

    const clientBeforeRefund = await ethers.provider.getBalance(client.address);
    const tx = await escrow.connect(client).refundPoster(questId);
    const receipt = await tx.wait();
    const gasPaid = receipt!.fee ?? receipt!.gasUsed * receipt!.gasPrice;
    const clientAfter = await ethers.provider.getBalance(client.address);

    expect(clientAfter + gasPaid - clientBeforeRefund).to.equal(reward);

    const after = await escrow.getQuest(questId);
    expect(after.status).to.equal(5); // Refunded
  });
});
