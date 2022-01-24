import * as fs from 'fs';
import { create } from 'ipfs-http-client';
import { ethers } from "hardhat";

const ipfsGatewayUrl : string = "https://ipfs.infura.io/ipfs";
async function main() {
    const filePath = "files/matrix1.jpg";
    const tokenid: number = 0;
    const tokenuri: string = "QmedjWpJDz19sheYHnPE5eptJGB2J85oL7RdppvoCy8UoY/metadata.json";
    
    const auth = 'Basic ' + Buffer.from(process.env.IPFS_PROJECTID + ':' + process.env.IPFS_SECRET).toString('base64')
    const ipfsClient = create( { 
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: { authorization: auth } 
    });

    // Upload image ti IPFS
    const fileName = filePath.replace(/^.*[\\\/]/, '')
    const file = fs.readFileSync(filePath);

    const { cid: imageCid } = await ipfsClient.add({ 
        path: `/nft/${fileName}`, 
        content: file
    })
    const imageUri = `${ipfsGatewayUrl}/${imageCid}/${fileName}`;
    console.log(`Uploaded image uri: ${imageUri}`);

    // Upload metadata to IPFS
    const metadata = new Metadata(imageUri, "The Matrix", "1. Matrix movie");
    const metadataJson = JSON.stringify(metadata);

    const { cid: metadataCid } = await ipfsClient.add({ 
        path: `/nft/metadata.json`,     
        content: metadataJson
    });
    console.log(`Uploaded metadata uri: ${ipfsGatewayUrl}/${metadataCid}/metadata.json`);

    // Deploy new smart contract
    const contractFactory = await ethers.getContractFactory("MoviePosters");
    const deployContract = await contractFactory.deploy("Movie Posters", "MP", "ipfs://");
    await deployContract.deployed();
    console.log(`Deployed to: ${deployContract.address}`);

    const [owner] = await ethers.getSigners();
    const mintTx = await deployContract.safeMintWithUri(owner.address, tokenid, tokenuri);
    await mintTx.wait();
    console.log(`Minted token ${tokenid}`);

    const tokenUri = await deployContract.tokenURI(tokenid);
    console.log(`Uri for token ${0}: ${tokenUri}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

class Metadata 
{
    image:string;
    name:string; 
    description:string;
    
    constructor(imageUri:string, name:string, desc:string)
    {
        this.image = imageUri;
        this.name = name;
        this.description = desc;
    }
}