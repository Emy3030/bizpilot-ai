const hre = require('hardhat');

async function main() {
  console.log('Deploying TrustRegistry to Base Sepolia...');

  const TrustRegistry = await hre.ethers.getContractFactory('TrustRegistry');
  const contract = await TrustRegistry.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('\n✅ TrustRegistry deployed at:', address);
  console.log('\nAdd this to backend/.env:');
  console.log(`TRUST_REGISTRY_CONTRACT_ADDRESS="${address}"`);
  console.log('\nView on BaseScan:');
  console.log(`https://sepolia.basescan.org/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
