// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract User {
    uint256 public uniqueId;
    string public name;

    constructor(uint256 _uniqueId, string memory _name) {
        uniqueId = _uniqueId;
        name = _name;
    }
}