const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/verifySignature', (req, res) => {
    const { message, signature, address } = req.body;

    try {
        const signerAddress = ethers.utils.verifyMessage(message, signature);
        if (signerAddress.toLowerCase() === address.toLowerCase()) {
            // authentication has succeeded, check for authorization.
            if (isAddressAuthorized(addressToCheck)) {
                // Take the action here for web3->web2 conversion. ie. MQTT msg send.
            }
            res.json({ 
                success: true,
                address: signerAddress,
                authorized : isAddressAuthorized(addressToCheck) 
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

/* Let's say this is the authorized wallet database in lower case fashion. */
const authorizedWallets = [
    "0x84C042fd9A4Bb8CE259eFc167A563043503ea1F3".toLowerCase(),
    // Add other wallet addresses here
];

function isAddressAuthorized(address) {
    return authorizedWallets.includes(address);
}
