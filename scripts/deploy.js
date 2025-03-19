const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Use the contract name "Attendance" to get the contract factory
  const Attendance = await ethers.getContractFactory("Attendance");
  
  // Deploy the contract
  const attendance = await Attendance.deploy();
  console.log("Attendance contract deployed to:", attendance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
