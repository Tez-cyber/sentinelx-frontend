// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract SentinelXOracle {
    address public owner;

    // Updaters are trusted addresses allowed to publish scores
    mapping(address => bool) public updaters;

    // Risk/Sentiment/Fusion + Confidence score
    struct Score {
        uint256 risk;
        uint256 sentiment;
        uint256 fusion;
        uint256 confidence; // reliability score (0 - 100)
        uint256 timestamp;
    }

    // Each protocol name (hashed) maps to an array of scores
    mapping(bytes32 => Score[]) private protocolScores;

    // Events to track updates and role changes
    event ScoreUpdated(
        string protocol,
        bytes32 key,
        uint256 risk,
        uint256 sentiment,
        uint256 fusion,
        uint256 confidence,
        uint256 timestamp,
        address updatedBy
    );

    event UpdaterAdded(address newUpdater);
    event UpdaterRemoved(address oldUpdater);
    event OwnershipTransferred(address oldOwner, address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyUpdater() {
        require(updaters[msg.sender], "not updater");
        _;
    }

    constructor(address _firstUpdater) {
        owner = msg.sender;
        if (_firstUpdater != address(0)) {
            updaters[_firstUpdater] = true;
            emit UpdaterAdded(_firstUpdater);
        }
    }

    // Allow owner to add more trusted updaters
    function addUpdater(address _updater) external onlyOwner {
        require(_updater != address(0), "zero addr");
        updaters[_updater] = true;
        emit UpdaterAdded(_updater);
    }

    // Allow owner to remove an updater
    function removeUpdater(address _updater) external onlyOwner {
        require(updaters[_updater], "not updater");
        updaters[_updater] = false;
        emit UpdaterRemoved(_updater);
    }

    // Transfer ownership
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "zero addr");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    // Publish new score for a protocol
    function publishScore(
        string calldata protocol,
        uint256 risk,
        uint256 sentiment,
        uint256 fusion,
        uint256 confidence
    ) external onlyUpdater {
        require(bytes(protocol).length > 0, "empty name");
        require(
            risk <= 100 && sentiment <= 100 && fusion <= 100 && confidence <= 100,
            "bad score"
        );

        bytes32 key = keccak256(abi.encodePacked(protocol));

        Score memory s = Score(risk, sentiment, fusion, confidence, block.timestamp);
        protocolScores[key].push(s);

        emit ScoreUpdated(
            protocol,
            key,
            risk,
            sentiment,
            fusion,
            confidence,
            s.timestamp,
            msg.sender
        );
    }

    // Get latest score for a protocol
    function getLatestScore(string calldata protocol)
        external
        view
        returns (uint256, uint256, uint256, uint256, uint256)
    {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        uint256 len = protocolScores[key].length;
        require(len > 0, "no scores");
        Score memory s = protocolScores[key][len - 1];
        return (s.risk, s.sentiment, s.fusion, s.confidence, s.timestamp);
    }

    // Get number of scores submitted for a protocol
    function getScoreCount(string calldata protocol) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        return protocolScores[key].length;
    }

    // Fetch score at a specific index
    function getScoreAt(string calldata protocol, uint256 index)
        external
        view
        returns (uint256, uint256, uint256, uint256, uint256)
    {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        require(index < protocolScores[key].length, "bad index");
        Score memory s = protocolScores[key][index];
        return (s.risk, s.sentiment, s.fusion, s.confidence, s.timestamp);
    }
}
