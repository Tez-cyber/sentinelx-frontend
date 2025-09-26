import hre from "hardhat";
import { expect } from "chai";

const { ethers } = hre;

describe("SentinelXOracle", function () {
  let Oracle, oracle, owner, updater, other;

  beforeEach(async function () {
    [owner, updater, other] = await ethers.getSigners();
    Oracle = await ethers.getContractFactory("SentinelXOracle");
    oracle = await Oracle.deploy(updater.address);
    await oracle.deployed();
  });

  it("should deploy with correct owner and first updater", async function () {
    expect(await oracle.owner()).to.equal(owner.address);
    expect(await oracle.updaters(updater.address)).to.equal(true);
  });

  it("should allow updater to publish a score", async function () {
    await oracle.connect(updater).publishScore("Uniswap", 50, 70, 60, 90);
    const [risk, sentiment, fusion, confidence, ts] =
      await oracle.getLatestScore("Uniswap");

    expect(risk.toNumber()).to.equal(50);
    expect(sentiment.toNumber()).to.equal(70);
    expect(fusion.toNumber()).to.equal(60);
    expect(confidence.toNumber()).to.equal(90);
    expect(ts.toNumber()).to.be.gt(0);
  });

  it("should revert if non-updater tries to publish", async function () {
    await expect(
      oracle.connect(other).publishScore("Uniswap", 50, 50, 50, 50)
    ).to.be.revertedWith("not updater");
  });

  it("should allow owner to add and remove updaters", async function () {
    await oracle.connect(owner).addUpdater(other.address);
    expect(await oracle.updaters(other.address)).to.equal(true);

    await oracle.connect(owner).removeUpdater(other.address);
    expect(await oracle.updaters(other.address)).to.equal(false);
  });

  it("should allow owner to transfer ownership", async function () {
    await oracle.connect(owner).transferOwnership(other.address);
    expect(await oracle.owner()).to.equal(other.address);
  });

  it("should store multiple scores and fetch by index", async function () {
    await oracle.connect(updater).publishScore("Aave", 40, 60, 50, 80);
    await oracle.connect(updater).publishScore("Aave", 30, 55, 45, 75);

    const count = await oracle.getScoreCount("Aave");
    expect(count.toNumber()).to.equal(2);

    const [risk, , , confidence, ] = await oracle.getScoreAt("Aave", 1);
    expect(risk.toNumber()).to.equal(30);
    expect(confidence.toNumber()).to.equal(75);
  });

  it("should validate score inputs (max 100)", async function () {
    await expect(
      oracle.connect(updater).publishScore("Aave", 101, 50, 50, 50)
    ).to.be.revertedWith("bad score");

    await expect(
      oracle.connect(updater).publishScore("Aave", 50, 50, 50, 150)
    ).to.be.revertedWith("bad score");
  });
});
