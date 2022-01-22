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

    