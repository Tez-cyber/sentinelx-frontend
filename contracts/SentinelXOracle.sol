// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract SentinelXOracle {
    address public owner;
    address public updater;

    struct Score {
        uint256 risk;
        uint256 sentiment;
        uint256 fusion;
        uint256 timestamp;
    }

    // store scores for each protocol by a hashed key
    mapping(bytes32 => Score[]) private protocolScores;

    event ScoreUpdated(
        string protocol,
        bytes32 key,
        uint256 risk,
        uint256 sentiment,
        uint256 fusion,
        uint256 timestamp,
        address updatedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyUpdater() {
        require(msg.sender == updater, "not updater");
        _;
    }

    constructor(address _updater) {
        owner = msg.sender;
        updater = _updater;
    }

    function setUpdater(address _newUpdater) external onlyOwner {
        updater = _newUpdater;
    }

    // updater pushes a new score for a protocol
    function publishScore(
        string calldata protocol,
        uint256 risk,
        uint256 sentiment,
        uint256 fusion
    ) external onlyUpdater {
        require(bytes(protocol).length > 0, "empty name");
        require(risk <= 100 && sentiment <= 100 && fusion <= 100, "invalid score");

        bytes32 key = keccak256(abi.encodePacked(protocol));

        Score memory s = Score(risk, sentiment, fusion, block.timestamp);
        protocolScores[key].push(s);

        emit ScoreUpdated(protocol, key, risk, sentiment, fusion, s.timestamp, msg.sender);
    }
}
