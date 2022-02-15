const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

let WLaddress = [
    '0x7772005Ad71b1BC6c1E25B3a82A400B0a8FC7680',
    '0xdF9A0573647079Fc6d083cFDF8FA3E4B03385a09',
    '0xf44F695CeEac08875d0B36812d4953879a702fEf',
];

const leafNodes = WLaddress.map( address => keccak256(address));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

const rootHash = merkleTree.getRoot();
console.log('rootHash ', rootHash.toString('hex'));


console.log('Whitelist Merkle Tree ', merkleTree.toString());

const claimingAddress = leafNodes[0];
console.log('claimingAddress ', claimingAddress);

const hexProof = merkleTree.getHexProof(claimingAddress);

console.log('hexProof ', hexProof);
