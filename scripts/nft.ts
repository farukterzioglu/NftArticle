import { task } from "hardhat/config";

task("DeployNft", "")
    .addParam("name", "Name of the Nft")
	.addParam("symbol", "Symbol of the Nft")
	.addParam("baseuri", "Base URI")
	.setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractFactory("MoviePosters");
        const deployed = await contract.deploy(taskArgs.name, taskArgs.symbol, taskArgs.baseuri);

        await deployed.deployed();

        console.log(`Deployed to: ${deployed.address}`);
    });


task("GetBaseUri", "")
    .addParam("contract", "Contract Hash")
    .setAction(async (taskArgs, hre) => {
        const contractFactory = await hre.ethers.getContractFactory("MoviePosters");
        const contractAttached = contractFactory.attach(taskArgs.contract);
    
        const baseUri = await contractAttached.getBaseURI();
    
        console.log(`Base uri: ${baseUri}`);
    });

task("SetBaseUri", "")
    .addParam("contract", "Contract Hash")
    .addParam("baseurl", "Base Url")
    .setAction(async (taskArgs, hre) => {
        const contractFactory = await hre.ethers.getContractFactory("MoviePosters");
        const contractAttached = contractFactory.attach(taskArgs.contract);

        const tx = await contractAttached.setBaseURI(taskArgs.baseurl);
        await tx.wait();
    
        const baseUri = await contractAttached.getBaseURI();
        console.log(`New base uri: ${baseUri}`);
    });
    
task("MintNft", "")
    .addParam("contract", "Hash of the Nft")
    .addParam("tokenid", "Token ID")
    .addParam("tokenuri", "Token uri")
    .setAction(async (taskArgs, hre) => {
        const contractFactory = await hre.ethers.getContractFactory("MoviePosters");
        const contractAttached = contractFactory.attach(taskArgs.contract);

        const [owner] = await hre.ethers.getSigners();

        const mintTx = await contractAttached.safeMintWithUri(owner.address, taskArgs.tokenid, taskArgs.tokenuri);
        await mintTx.wait();
        
        console.log(`Minted token ${taskArgs.tokenid} with uri ${taskArgs.tokenuri}`);
      });

task("GetTokenUri", "")
    .addParam("contract", "Hash of the Nft")
    .addParam("tokenid", "Token ID")
    .setAction(async (taskArgs, hre) => {
        const contractFactory = await hre.ethers.getContractFactory("MoviePosters");
        const contractAttached = contractFactory.attach(taskArgs.contract);

        const tokenUri = await contractAttached.tokenURI(taskArgs.tokenid);
        console.log(`Uri for token ${0}: ${tokenUri}`);
    });
  
