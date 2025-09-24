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
}
