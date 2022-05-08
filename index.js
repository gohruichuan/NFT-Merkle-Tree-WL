const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { ethers } = require('ethers');

let WLaddress = {
    "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680": 2,
    "0xf44F695CeEac08875d0B36812d4953879a702fEf": 1,
    "0xf809fb06B3dD09b453e432263e75AA4aF0C82685": 5,
    "0xdF9A0573647079Fc6d083cFDF8FA3E4B03385a09": 1
}
  

const hashLeaf = (address, allowedMintQty) => {
    const hash = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'uint256'], [address, allowedMintQty]).slice(2),
      'hex'
    );
    return hash;
}

const getMerkleTree = () => {
    // hash all whitelisted addresses and allowed mint quantity as the leafNode in MerkleTree
    const leafNodes = Object.entries(WLaddress).map((whitelistee) =>
      hashLeaf(...whitelistee)
    );
    // create merkle tree
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

    //return merkleRoot, it is required to set the merkle root on the SC side!
    //NOTE: need to add '0x' infront of the merkleroot before setting merkle root on SC side
    //return merkleTree, it is required to verify the merkle proof later
    //return leafNodes, it is required to verify the merkle proof later
    return {
      merkleRoot: merkleTree.getRoot().toString('hex'),
      merkleTree: merkleTree,
      leafNodes: leafNodes,
    };
}

const getMerkleProof = (address, leafNodes, merkleRoot, merkleTree) => {
    // find index of whitelisted address of the connected wallet address, this is required because need to know which leafNode to get
    const addressIndex = Object.keys(WLaddress).indexOf(address);

    console.log('addressIndex ', addressIndex);

    // if addressIndex is -1, means the connected wallet address is not whitelisted
    if (addressIndex < 0) {
      return null;
    }
    // get leaf node of connected wallet address
    const claimingLeafNode = leafNodes[addressIndex];

    // get merkle proof of connected wallet address
    const hexProof = merkleTree.getHexProof(claimingLeafNode);

    // Check if the merkle proof is valid based on the merkle root generated in getMerkleTree()
    const isProofVerified = merkleTree.verify(hexProof, claimingLeafNode, merkleRoot);
    console.log('isProofVerified ', isProofVerified);

    // if merkle proof is invalid, means the connected wallet address is not whitelisted
    if (!isProofVerified) {
      return null;
    }

    return hexProof;
}
const { merkleRoot, merkleTree, leafNodes } = getMerkleTree();

const merkleProof = getMerkleProof(
    "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680",
    leafNodes,
    merkleRoot,
    merkleTree
);

console.log("merkleRoot ", merkleRoot);
console.log("merkleTree ", merkleTree);
console.log("merkleProof ", merkleProof);