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

  it("should allow updater to set a prediction", async function () {
    const tx = await oracle.connect(updater).setPrediction("BTC-USD", 50000);
    await tx.wait();

    const [value, timestamp] = await oracle.getPrediction("BTC-USD");
    expect(value).to.equal(50000);
    expect(timestamp).to.be.gt(0);
  });

  it("should revert if non-updater tries to set prediction", async function () {
    await expect(
      oracle.connect(user).setPrediction("ETH-USD", 3000)
    ).to.be.revertedWith("Not authorized");
  });

  it("should return 0 for unset prediction", async function () {
    const [value, timestamp] = await oracle.getPrediction("DOGE-USD");
    expect(value).to.equal(0);
    expect(timestamp).to.equal(0);
  });
});
