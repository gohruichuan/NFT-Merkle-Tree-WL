const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("ethers");

let allowlist = [
  "0xf809fb06B3dD09b453e432263e75AA4aF0C82685",
  "0xfdB01cacf2C39BDc7993F2FeaD015EB06C5361A9",
  "0x2F3DDC7B3042fF6368c33F8AFFbA8d28588B171d",
  "0x6329001db7fa0F736273aa3902A8E1838ca0f6B2",
  "0xC5603BF8995866D9EE631913a9f68997761a9125",
  "0x56591469E59e00b9425bABE017f52a1837b80345",
  "0xeaEB41bd163Df7d95AD668fa25dbdB4363B9b8f2",
  "0xF82225b535c540FDb4DcA3c5dBc597E51F9b298c",
  "0x5De0F530bCe19226650a85dA067982dF5ADfa20A",
  "0xDa8Be7D180d48E647e97380AbA69c0d3031205B0",
  "0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680",
  "0xEc7A9CB6e54E478185926513F8Bf540204Ffa128",
  "0xded9f86051DAc056c224a0DF2753c32D05a7c2b1",
  "0xfe1dB923FEb6056a9eD7f04562D1FaaDd2eA9Cdd",
  "0xDCaa97aEc40eafb45EDDaD5F3ee2EA27574ef1B0",
  "0x11BCc9005f7C2571a00E31191e9ad1F127317804",
  "0x87EF5B47dD9D6d28Dc9FF0476DbCAda87Bdc31aa",
  "0xa50AC2999Ac983920218B55aB2aA16fA09D08715",
  "0x9e48FA22a15D03a2F77B0a0Aa296ac540691C85d",
  "0xae399849459158551eBd414B1dd6DcfAb2cD0c7D",
  "0x5255C6Ad4c37cfA27aA6C32c2a80eb77CD22c4Ea",
  "0xdD9B3756f2BE9d490673def9261D8C02a2d0d7A1",
  "0x32d6A3bE6fEfBee2CCe0966825d610981c884369",
  "0x77eCEE57697718A383093f14e89E3661dF3268F4",
  "0x87Da30171Eaae7c3b1e89D5BB3A7e44FBE281A3d",
  "0xB8849114cb1850b28CCaEff462856e5Fe121BE39",
  "0x5FbE60d036634ae099a73345793a9787A6006fC4",
];

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

  // console.log("isProofVerified ", isProofVerified);
  // If merkle proof is invalid, means the connected wallet address is not whitelisted
  if (!isProofVerified) {
    return null;
  }

  return hexProof;
};
const { merkleRoot, merkleTree, leafNodes } = getMerkleTree(allowlist);

const merkleProof = getMerkleProof(
  "0xded9f86051DAc056c224a0DF2753c32D05a7c2b1",
  leafNodes,
  merkleRoot,
  merkleTree
);

console.log("merkleRoot ", merkleRoot);
// console.log("merkleTree ", merkleTree);
console.log("merkleProof ", merkleProof);
