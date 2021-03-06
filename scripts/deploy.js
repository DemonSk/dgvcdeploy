const hre = require("hardhat");
const { utils } = require("ethers");

async function main() {
  const [deployer] = await ethers.getSigners();

  const baseUnit = 18;
  const router = "0x0000000000000000000000000000000000000000";
  const burnCycle = utils.parseUnits("5000", baseUnit).toBigInt();
  const rebaseDelta = utils.parseUnits("4000", baseUnit).toBigInt();

  console.log("Deploying contracts with the account:", deployer.address);

  const DGVC = await ethers.getContractFactory("DegenVC1");
  const DGVCImplementation = await ethers.getContractFactory(
    "DGVCImplementation"
  );
  const dgvcImplementation = await DGVCImplementation.deploy();
  await dgvcImplementation.deployed();

  const dgvc = await DGVC.deploy();

  await dgvcImplementation.init(router);
  await dgvcImplementation.renounceOwnership();

  const DGVCProxy = await hre.ethers.getContractFactory("DGVCProxy");
  let dgvcProxy = await DGVCProxy.deploy();
  await dgvcProxy.deployed();

  await dgvcProxy.setImplementation(dgvcImplementation.address);

  dgvcProxy = new ethers.Contract(
    dgvcProxy.address,
    DGVCImplementation.interface,
    deployer
  );

  await dgvcProxy.init(router);

  await dgvcProxy.setRebaseDelta(rebaseDelta);
  await dgvcProxy.setBurnCycle(burnCycle);

  console.log("dgvcProxy deployed to:", dgvcProxy.address);
  console.log(
    "degenv1: ",
    dgvc.address,
    "degenv2: ",
    dgvcImplementation.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
