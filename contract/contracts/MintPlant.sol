// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Chainlink
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract MintPlant is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    ChainlinkClient,
    KeeperCompatible
{
    using Counters for Counters.Counter;
    using Chainlink for Chainlink.Request;

    Counters.Counter private _tokenIdCounter;

    // Map Refresher Variables
    string public mapURI;
    bytes32 private jobId;
    uint256 private fee;

    uint256 public lastRefreshedTokenid;

    // Custom Events
    event RequestMapURI(bytes32 indexed requestId, string uri);

    /**
     * @notice Initialize the NFT Smart contract and target chainlink oracle
     *
     * Rinkeby Testnet details:
     * Link Token: 0x01BE23585060835E02B77ef475b0Cc51aA1e0709
     * Oracle: 0xf3FBB7f3391F62C8fe53f89B41dFC8159EE9653f (Chainlink DevRel)
     * jobId: 7d80a6386ef543a3abb52817f6707e3b
     *
     */
    constructor() ERC721("MintPlant", "MP") {
        setChainlinkToken(0x01BE23585060835E02B77ef475b0Cc51aA1e0709);
        setChainlinkOracle(0xf3FBB7f3391F62C8fe53f89B41dFC8159EE9653f);
        jobId = '7d80a6386ef543a3abb52817f6707e3b';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * Create a Chainlink request to retrieve the latest map JSON URI
     */
    function refreshMapURI() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillRefreshMapURI.selector);

        // Set the URL to perform the GET request on
        req.add('get', 'https://mqqnkgtp6f.execute-api.us-east-1.amazonaws.com/default/MintPlantMap');
        req.add('path', 'uri');

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        uint256 tokenId = _tokenIdCounter.current();
        upkeepNeeded = lastRefreshedTokenid < tokenId;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        refreshMapURI();
        uint256 tokenId = _tokenIdCounter.current();
        lastRefreshedTokenid = tokenId;
    }

    /**
     * Receive the response in the form of string
     */
    function fulfillRefreshMapURI(bytes32 _requestId, string calldata _uri) public recordChainlinkFulfillment(_requestId) {
        emit RequestMapURI(_requestId, _uri);
        mapURI = _uri;
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
