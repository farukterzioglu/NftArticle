import * as fs from 'fs';
import { task } from "hardhat/config";
import { create, IPFSHTTPClient } from 'ipfs-http-client';

function createIpfsClient() : IPFSHTTPClient{
    const auth = 'Basic ' + Buffer.from(process.env.IPFS_PROJECTID + ':' + process.env.IPFS_SECRET).toString('base64')
    const remoteClient = create( { 
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: { authorization: auth } 
    });

    return remoteClient;
}

const ipfsGatewayUrl = "https://ipfs.infura.io/ipfs";
task("UploadImage", "")
    .addParam("fullpath", "Image path")
	.setAction(async (taskArgs) => {
        const ipfsClient = createIpfsClient();

        const fileName = taskArgs.fullpath.replace(/^.*[\\\/]/, '')
        const file = fs.readFileSync(taskArgs.fullpath);

        const { cid: metadataCid } = await ipfsClient.add({ 
            path: `/nft/${fileName}`, 
            content: file
        })
        console.log(`Uploaded image uri: ${ipfsGatewayUrl}/${metadataCid}/${fileName}`);
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

task("UploadMetadata", "")
    .addParam("imageuri", "Image URI")
    .addParam("name", "NFT name")
    .addParam("desc", "Description")
	.setAction(async (taskArgs) => {
        const ipfsClient = createIpfsClient();

        const metadata = new Metadata(taskArgs.imageuri, taskArgs.name, taskArgs.desc);
        const metadataJson = JSON.stringify(metadata);

        const { cid: metadataCid } = await ipfsClient.add({ 
            path: `/nft/metadata.json`,     
            content: metadataJson
        });
        console.log(`Uploaded image uri: ${ipfsGatewayUrl}/${metadataCid}/metadata.json`);
    });