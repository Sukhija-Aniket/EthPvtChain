// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract User {

    uint256 public userId;
    string public name;

    constructor(uint256 _userId, string memory _name) {
        userId = _userId;
        name = _name;
    }
}

