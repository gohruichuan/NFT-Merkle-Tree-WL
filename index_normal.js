const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("ethers");

let allowlist = [
  "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680",
  "0xf809fb06B3dD09b453e432263e75AA4aF0C82685",
  "0xdF9A0573647079Fc6d083cFDF8FA3E4B03385a09",
];

// let allowlist = [
//   "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680",
//   "0xEc7A9CB6e54E478185926513F8Bf540204Ffa128",
//   "0xded9f86051DAc056c224a0DF2753c32D05a7c2b1",
//   "0xfe1dB923FEb6056a9eD7f04562D1FaaDd2eA9Cdd",
// ];

// const hashLeaf = (address, allowedMintQty) => {
//   const hash = Buffer.from(
//     ethers.utils
//       .solidityKeccak256(["address", "uint256"], [address, allowedMintQty])
//       .slice(2),
//     "hex"
//   );
//   return hash;
// };

const getMerkleTree = (allowlist) => {
  // Hash all whitelisted addresses
  const leafNodes = allowlist.map((addr) => keccak256(addr));

  // Create merkle tree
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  // Return merkleRoot, it is required to set the merkle root on the SC side!
  // NOTE: need to add '0x' infront of the merkleroot before setting merkle root on SC side
  // Return merkleTree, it is required to verify the merkle proof later
  // Return leafNodes, it is required to verify the merkle proof later
  return {
    merkleRoot: merkleTree.getRoot().toString("hex"),
    merkleTree: merkleTree,
    leafNodes: leafNodes,
  };
};

const getMerkleProof = (address, leafNodes, merkleRoot, merkleTree) => {
  // Find index of whitelisted address of the connected wallet address, this is required because need to know which leafNode to get
  const addressIndex = allowlist.indexOf(address);

  // If addressIndex is -1, means the connected wallet address is not whitelisted
  if (addressIndex < 0) {
    return null;
  }
  // Get leaf node of connected wallet address
  const claimingLeafNode = leafNodes[addressIndex];

  // Get merkle proof of connected wallet address
  const hexProof = merkleTree.getHexProof(claimingLeafNode);

  // Check if the merkle proof is valid based on the merkle root generated in getMerkleTree()
  const isProofVerified = merkleTree.verify(
    hexProof,
    claimingLeafNode,
    merkleRoot
  );

  // If merkle proof is invalid, means the connected wallet address is not whitelisted
  if (!isProofVerified) {
    return null;
  }

  return hexProof;
};
const { merkleRoot, merkleTree, leafNodes } = getMerkleTree(allowlist);

const merkleProof = getMerkleProof(
  "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680",
  leafNodes,
  merkleRoot,
  merkleTree
);

console.log("merkleRoot ", merkleRoot);
// console.log("merkleTree ", merkleTree);
console.log("merkleProof ", merkleProof);
