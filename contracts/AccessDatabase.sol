/**
 *Submitted for verification at Etherscan.io on 2024-01-11
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessDatabase {
    // Store the list of authorized addresses
    mapping(address => bool) private authorizedAddresses;

    // The owner of the contract
    address private owner;

    constructor() {
        // Set the contract deployer as the owner
        owner = msg.sender;
    }

    // Modifier to restrict functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to add an address to the list of authorized addresses
    function authorizeAddress(address _address) public onlyOwner {
        authorizedAddresses[_address] = true;
    }

    // Function to remove an address from the list of authorized addresses
    function revokeAddress(address _address) public onlyOwner {
        authorizedAddresses[_address] = false;
    }

    // Function to check if an address is authorized
    function isAuthorized(address _address) public view returns (bool) {
        return authorizedAddresses[_address];
    }

    // Example of a function that checks for authorization
    function performAuthorizedAction() public view returns (string memory) {
        require(isAuthorized(msg.sender), "You are not authorized to perform this action");
        return "Authorized action performed";
    }
}