async function main() {
  const Oracle = await ethers.getContractFactory("SentinelXOracle");

  
  const oracle = await Oracle.deploy("0xff5B05CE80024A46a684908E62434EDB1E7fb1fF");

  await oracle.deployed();

  console.log("✅ SentinelXOracle deployed at:", oracle.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
