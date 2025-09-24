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

    event UpdaterChanged(address oldUpdater, address newUpdater);
    event OwnershipTransferred(address oldOwner, address newOwner);

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
        require(_newUpdater != address(0), "zero addr");
        emit UpdaterChanged(updater, _newUpdater);
        updater = _newUpdater;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "zero addr");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    function publishScore(
        string calldata protocol,
        uint256 risk,
        uint256 sentiment,
        uint256 fusion
    ) external onlyUpdater {
        require(bytes(protocol).length > 0, "empty name");
        require(risk <= 100 && sentiment <= 100 && fusion <= 100, "bad score");

        bytes32 key = keccak256(abi.encodePacked(protocol));

        Score memory s = Score(risk, sentiment, fusion, block.timestamp);
        protocolScores[key].push(s);

        emit ScoreUpdated(protocol, key, risk, sentiment, fusion, s.timestamp, msg.sender);
    }

    function getLatestScore(string calldata protocol)
        external
        view
        returns (uint256, uint256, uint256, uint256)
    {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        uint256 len = protocolScores[key].length;
        require(len > 0, "no scores");
        Score memory s = protocolScores[key][len - 1];
        return (s.risk, s.sentiment, s.fusion, s.timestamp);
    }

    function getScoreCount(string calldata protocol) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        return protocolScores[key].length;
    }

    function getScoreAt(string calldata protocol, uint256 index)
        external
        view
        returns (uint256, uint256, uint256, uint256)
    {
        bytes32 key = keccak256(abi.encodePacked(protocol));
        require(index < protocolScores[key].length, "bad index");
        Score memory s = protocolScores[key][index];
        return (s.risk, s.sentiment, s.fusion, s.timestamp);
    }
}
