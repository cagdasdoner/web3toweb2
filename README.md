# webby3
Web2 to Web3 transition from client to chain 

This demo can be used to show how centralized Web2 can be converted to decentralized Web3.

An address will be used to sign epoch time to prove its authentication.

A database will be used to store the authorization info of the address.

At server.js, according the functions called, we can choose to use decentralized or centralized database.

## Centralized Database 
A dummy array at server side to show how we get data from centralized systems.

## De-Centralized Database 
A simplistic contract deployed at Goerli to get, set and revoke the authorization data of the address.

Only contract owner will be able to set and revoke to the chain.

Server side will be reading the data and fetch onChain authorization data and can take action accordingly.

# Still not Completely Decentralized
Server side code currently verifies the signature and interacts with the chain. 

There should be more to come!

# Install and Run
npm install

node server.js

Open your browser and navigate to http://localhost:3000
