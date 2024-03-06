//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Object.sol";
import "./User.sol";

contract ObjectManager {

    struct ObjectData {
        uint256 objectId;
        uint256 value;
        address currentOwner;
        address[] history;
    }

    struct UserData {
        string name;
        uint256 userId;
        uint256[] userObjects;
    }

    // State Variables and Mappings
    mapping(address => uint256[]) public ownedObjects; // 
    mapping(uint256 => Object) public objects; // identifier for each object
    mapping(uint256 => User) public users; // identifier for each User
    uint256 public nextUserId = 1;

    // Event declarations for UI interactions or transaction logs
    event UserRegistered(uint256 userId, string name, address owner);
    event ObjectRegistered(uint256 objectId, uint256 userId);
    event OwnershipTransferred(uint256 objectId, uint256 userId);
    event TransferCancelled(uint256 objectId, uint256 userId, string reason);


    // Modifiers
    modifier checkUnregisteredObject(uint256 _objectId) {
        require(address(objects[_objectId]) == address(0), "Object already exists.");
        _;
    }

     modifier checkRegisteredObject(uint256 _objectId) {
        require(address(objects[_objectId]) != address(0), "Object does not exist.");
        _;
    }

    modifier checkSameUser(uint256 _objectId, uint256 _userId) {
        require(objects[_objectId].currentOwner() != address(users[_userId]),"Cannot Transfer back to the same User");
        _;
    }

    modifier checkUserExists(uint256 _userId) {
        require(address(users[_userId]) != address(0), "User does not exists");
        _;
    }

    function registerUser(string memory _name) public returns (uint256) {

        User newUser = new User(nextUserId, _name);
        users[nextUserId] = newUser;
        emit UserRegistered(nextUserId, _name, msg.sender);

        nextUserId++;
        return nextUserId - 1;
    }

    function registerObject(uint256 _objectId, uint256 _value, uint256 _userId) public checkUnregisteredObject(_objectId) checkUserExists(_userId) {
        Object newObj = new Object(_objectId, _value, address(users[_userId]));
        objects[_objectId] = newObj;
        ownedObjects[address(users[_userId])].push(_objectId);
        emit ObjectRegistered(_objectId, _userId);
    }

    // Function to transfer object ownership
    function transferOwnership(uint256 _objectId, uint256 _userId) public checkSameUser(_objectId, _userId) checkUserExists(_userId) {
        // Require that the msg.sender owns the object
        
        // Change ownership in the Object contract
        address currentOwner = objects[_objectId].currentOwner();
        address newOwner = address(users[_userId]);
        objects[_objectId].changeOwnership(newOwner);

        // see if a better approach is possible, as arrays can be very costly
        uint256[] storage currentOwnerObjects = ownedObjects[currentOwner];
        for (uint i = 0; i < currentOwnerObjects.length; i++) {
            if (currentOwnerObjects[i] == _objectId) {
                currentOwnerObjects[i] = currentOwnerObjects[currentOwnerObjects.length - 1];
                currentOwnerObjects.pop();
                break;
            }
        }
        
        // Add object to the new owner's list
        ownedObjects[newOwner].push(_objectId);
        emit OwnershipTransferred(_objectId, _userId);
    }

    // Function to get the list of object IDs owned by a user
    function getOwnedObjects(uint256 _userId) public view checkUserExists(_userId) returns (uint256[] memory userObjects) {
        return ownedObjects[address(users[_userId])];
    }

    function getUser(uint256 _userId) public view checkUserExists(_userId) returns (UserData memory userData) {
        userData.name = users[_userId].name();
        userData.userId = _userId;
        uint256[] storage currentOwnerObjects = ownedObjects[address(users[_userId])]; 
        userData.userObjects = currentOwnerObjects;
        return userData;
    }

    function getObject(uint _objectId) public view checkRegisteredObject(_objectId) returns (ObjectData memory objectData) {
        objectData.objectId = _objectId;
        objectData.value = objects[_objectId].value();
        objectData.currentOwner = objects[_objectId].currentOwner();
        address[] memory historyData = objects[_objectId].getCompleteHistory();
        objectData.history = historyData;
        return objectData;
    }
}
