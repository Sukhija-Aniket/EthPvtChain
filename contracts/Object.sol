// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Object {
    uint256 public objectId;
    uint256 public value;   
    address public currentOwner;
    address[] public history;

    constructor(uint256 _objectId, uint256 _value, address _owner) {
        
        objectId = _objectId;
        value = _value;
       
        currentOwner = _owner; // address of a User Contract
        history.push(_owner);
    }

    function changeOwnership(address _newOwner) public {
        currentOwner = _newOwner;
        history.push(_newOwner);
    }

    function getCompleteHistory() public view returns (address[] memory) {
        return history;
    }
}