const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("ethers");

let WLaddress = {
  "0xF4e85aa37036AdB5bAc40cb69aB0Bf5F25E2c646": 5,
  "0xeEfadC73440963463D1bb0fD381965B7448d2B25": 3,
  "0x47995B10a424932a87A5Cc5b841FfA33135005a6": 5,
  "0x7eEE819759C99f49f887E2da66Dbb17dbbFE61ba": 4,
  "0xa0B0D5Af4880c53Ea2B8A8B917f3ccD685C83620": 3,
  "0x1f1079466cca98644Cd945Db595dd12B579068Ac": 2,
  "0xBe774518796da610525c13dCa0747aC307c7f06C": 1,
  "0x3234f1F923b63e4C592d35d12af598009E0BB4c5": 5,
  "0xd19137A8db2A963aF150c4707C921076C1273E01": 4,
  "0xE9A553320F774eb9cFFa104f65B2b013Eb756e28": 3,
  "0x9a1366635e6137FedBE3Ae539a42D456a0Ad8121": 2,
  "0xd235632B1FFc48f9919D4E063BCA5Fa3c4c1837b": 1,
  "0xbfcC53f8da5220035437c6dD5F85d3f6495AD4Cd": 5,
  "0xBB1018CAf5518059D3b7B7CC0FceA75236D85992": 4,
  "0xf44F695CeEac08875d0B36812d4953879a702fEf": 3,
  "0xdF9A0573647079Fc6d083cFDF8FA3E4B03385a09": 2,
  "0xfe1dB923FEb6056a9eD7f04562D1FaaDd2eA9Cdd": 1,
  "0x67C109C97e1172880259d5Be090FAEAD17CC52Eb": 5,
  "0x5ea9E49A8D67B2618838b3953f32b579c9970F2d": 4,
  "0x15bF0Ae8C738a18292a037D6C80AB792b9D5006A": 3,
  "0x4f68aFcD5eD35aF2625f6e89dC6E5682ef870aFA": 2,
  "0xBC78A5E0B06EDB3d41446De92E847558aFBa7D8C": 3,
  "0xf809fb06B3dD09b453e432263e75AA4aF0C82685": 5,
  "0xfdB01cacf2C39BDc7993F2FeaD015EB06C5361A9": 4,
  "0xF617a5D99D87a0E216a0033878D16537174D2D86": 3,
  "0x2FC7AE9bC3ceDE744053717dE54ca8A6ea76765c": 2,
  "0x5aFcc567971917eBf6f6aD1F01C3cf2F9aF9a1BC": 1,
  "0x3ed4B3746162225Bc79BF15D4e3aC3A1da194aD5": 5,
};

const hashLeaf = (address, allowedMintQty) => {
  const hash = Buffer.from(
    ethers.utils
      .solidityKeccak256(["address", "uint256"], [address, allowedMintQty])
      .slice(2),
    "hex"
  );
  return hash;
};

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
    merkleRoot: merkleTree.getRoot().toString("hex"),
    merkleTree: merkleTree,
    leafNodes: leafNodes,
  };
};

const getMerkleProof = (address, leafNodes, merkleRoot, merkleTree) => {
  // find index of whitelisted address of the connected wallet address, this is required because need to know which leafNode to get
  const addressIndex = Object.keys(WLaddress).indexOf(address);

  console.log("addressIndex ", addressIndex);

  // if addressIndex is -1, means the connected wallet address is not whitelisted
  if (addressIndex < 0) {
    return null;
  }
  // get leaf node of connected wallet address
  const claimingLeafNode = leafNodes[addressIndex];

  // get merkle proof of connected wallet address
  const hexProof = merkleTree.getHexProof(claimingLeafNode);

  // Check if the merkle proof is valid based on the merkle root generated in getMerkleTree()
  const isProofVerified = merkleTree.verify(
    hexProof,
    claimingLeafNode,
    merkleRoot
  );
  console.log("isProofVerified ", isProofVerified);

  // if merkle proof is invalid, means the connected wallet address is not whitelisted
  if (!isProofVerified) {
    return null;
  }

  return hexProof;
};
const { merkleRoot, merkleTree, leafNodes } = getMerkleTree();

const merkleProof = getMerkleProof(
  "0xfe1dB923FEb6056a9eD7f04562D1FaaDd2eA9Cdd",
  leafNodes,
  merkleRoot,
  merkleTree
);

console.log("merkleRoot ", merkleRoot);
// console.log("merkleTree ", merkleTree);
console.log("merkleProof ", merkleProof);
