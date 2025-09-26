const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SentinelXOracle", function () {
  let oracle, owner, updater, user;

  beforeEach(async function () {
    [owner, updater, user] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("SentinelXOracle");
    oracle = await Oracle.deploy(updater.address);
    await oracle.deployed();
  });

  it("should deploy with correct updater", async function () {
    expect(await oracle.updater()).to.equal(updater.address);
  });

  it("should allow updater to publish a score", async function () {
    const tx = await oracle.connect(updater).publishScore("BTC-USD", 80, 70, 90);
    await tx.wait();

    const [risk, sentiment, fusion, timestamp] = await oracle.getLatestScore("BTC-USD");

    expect(risk).to.equal(80);
    expect(sentiment).to.equal(70);
    expect(fusion).to.equal(90);
    expect(timestamp).to.be.gt(0);

    expect(await oracle.getScoreCount("BTC-USD")).to.equal(1);
  });

  it("should revert if non-updater tries to publish a score", async function () {
    await expect(
      oracle.connect(user).publishScore("ETH-USD", 50, 50, 50)
    ).to.be.revertedWith("not updater");
  });

  it("should revert if getLatestScore is called before any scores", async function () {
    await expect(oracle.getLatestScore("DOGE-USD")).to.be.revertedWith("no scores");
  });
});
