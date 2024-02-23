// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Object {
    uint256 public uniqueId;
    uint256 public value;
    address public currentOwner;
    address[] public history;

    constructor(uint256 _uniqueId, uint256 _value, address _owner) {
        uniqueId = _uniqueId;
        value = _value;
       
        currentOwner = _owner;
        history.push(_owner);
    }

    function changeOwnership(address _newOwner) public {
        currentOwner = _newOwner;
        history.push(_newOwner);
    }
}