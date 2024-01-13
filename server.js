const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const contractAddress = '0xF9292b8E8f8D6AAb9e9721b046F3112F39f3e000';
const NETWORK = 'goerli';
const INFURA_KEY = 'INFURA_KEY_HERE';

/* DE-Centralized Database Operations */
async function isAddressAuthorizedOnChain(address) {
    const contractABI = require('./abis/AccessDatabaseABI.json');
    const provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_KEY);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    return contract.isAuthorized(address);
}

/* Centralized Database Operations */
/* Let's say this is the authorized wallet database in lower case fashion. */
const authorizedWalletsServerSideDatabase = [
    "0x84C042fd9A4Bb8CE259eFc167A563043503ea1F3".toLowerCase(),
    // Add other wallet addresses here
];

/* Getter for Server Side Database */
function isAddressAuthorizedServerSide(address) {
    return authorizedWalletsServerSideDatabase.includes(address);
}

app.post('/verifySignature', async (req, res) => {
    const { message, signature, address } = req.body;
    console.log(message, signature, address);
    try {
        const signerAddress = ethers.utils.verifyMessage(message, signature);
        console.log(signerAddress);
        if (signerAddress.toLowerCase() === address.toLowerCase()) {
            // authentication has succeeded, check for authorization.
            //var isAuthorized = isAddressAuthorizedServerSide(address.toLowerCase())
            var isAuthorized = await isAddressAuthorizedOnChain(address.toLowerCase());
            if (isAuthorized) {
                // Take server side action here if authorized.
            }
            res.json({ 
                success: true,
                address: signerAddress,
                authorized : isAuthorized
            });
        } else {
            throw new Error('Signature does not match the provided address.');
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


