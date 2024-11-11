// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftFactory is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    mapping(string => uint8) existingUris;

    constructor(
        address initialOwner
    ) ERC721("NftFactory", "NFT") Ownable(initialOwner) {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function isContentOwned(string memory uri) public view returns (bool) {
        return existingUris[uri] == 1;
    }

    function payToMint(
        address recipient,
        string memory metadataUri
    ) public payable returns (uint256) {
        require(existingUris[metadataUri] != 1, "NFT already minted");
        require(msg.value >= 0.01 ether, "Need to pay more");

        uint256 newItemId = _nextTokenId++;
        existingUris[metadataUri] = 1;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, metadataUri);

        return newItemId;
    }
}
