pragma solidity ^0.8.0;

contract AccessControl {
    mapping(address => bool) private authorizedAddresses;
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function authorizeAddress(address _address) public onlyOwner {
        authorizedAddresses[_address] = true;
    }

    function revokeAddress(address _address) public onlyOwner {
        authorizedAddresses[_address] = false;
    }

    function isAuthorized(address _address) public view returns (bool) {
        return authorizedAddresses[_address];
    }

    function verifyAndAuthorize(bytes32 hash, bytes memory signature) public view returns (bool) {
        address signer = recover(hash, signature);
        return authorizedAddresses[signer];
    }

    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        return (r, s, v);
    }
}
