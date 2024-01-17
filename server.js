const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const INFURA_KEY = 'SET_YOUR_API_KEY_HERE';
/* Deployed on: Sepolia */
const contractAddress = '0x9fff571b67f72e22a6d37eb782bff2400add06d4';
const apiURL = "https://sepolia.infura.io/v3/" + INFURA_KEY;

/* DE-Centralized Database Operations */
async function isAddressAuthorizedOnChain(address) {
    const contractABI = require('./abis/AccessDatabaseABI.json');
    const apiProvider = new ethers.providers.JsonRpcProvider(apiURL);
    const contract = new ethers.Contract(contractAddress, contractABI, apiProvider);

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

app.post('/verifyUser', async (req, res) => {
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
                // Take server side (Trusted Environment) action here if authorized.
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


