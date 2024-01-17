const connectWalletButton = document.getElementById('connectWallet');
const disconnectWalletButton = document.getElementById('disconnectWallet');
const walletAddressDisplay = document.getElementById('walletAddress');
const signatureResult = document.getElementById('signatureResult');
const serverAuthenticationButton = document.getElementById('serverAuthentication');
const onChainAuthenticationButton = document.getElementById('onChainAuthentication');
const verificationResult = document.getElementById('verificationResult');
const authorizationResult = document.getElementById('authorizationResult');

let provider, signer;
let connectedWalletAddress = null;

const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            connectedWalletAddress = await signer.getAddress();
            console.log('Wallet connected:', connectedWalletAddress);
            walletAddressDisplay.textContent = `Connected Wallet Address: ${connectedWalletAddress}`;
            toggleConnectButton(false);
        } catch (error) {
            console.error('Connection error:', error);
        }
    } else {
        console.log('Wallet is not available!');
    }
};

const disconnectWallet = () => {
    signer = null;
    connectedWalletAddress = null;
    console.log('Wallet disconnected');
    walletAddressDisplay.textContent = 'Connected Wallet Address: Not Connected';
    toggleConnectButton(true);
};

const toggleConnectButton = (showConnect) => {
    if (showConnect) {
        connectWalletButton.style.display = 'block';
        disconnectWalletButton.style.display = 'none';
    } else {
        connectWalletButton.style.display = 'none';
        disconnectWalletButton.style.display = 'block';
    }
};

connectWalletButton.addEventListener('click', connectWallet);
disconnectWalletButton.addEventListener('click', disconnectWallet);

/* Server-side verification upon the signed message */
serverAuthenticationButton.addEventListener('click', async () => {
    if (signer && connectedWalletAddress) {
        try {
            // Use epoch in the data to be signed to prevent replay attacks.
            const message = `${Date.now()}`;
            const signature = await signer.signMessage(message);
            signatureResult.textContent = `Signed Message: ${signature}`;
            // Send the signature and message to the server for verification
            fetch('/verifyUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, signature, address: connectedWalletAddress }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    verificationResult.textContent = 'Signature verified successfully';
                    if (data.authorized) {
                        authorizationResult.textContent = 'Authorized.';
                    } else {
                        authorizationResult.textContent = 'UnAuthorized!';
                    }
                } else {
                    verificationResult.textContent = 'Verification failed!';
                }
            });
        } catch (error) {
            console.error('Signing error:', error);
            signatureResult.textContent = 'Error signing message.';
        }
    } else {
        console.log('No wallet connected for signing.');
        signatureResult.textContent = 'Please connect to a wallet first.';
    }
});

/* On-Chain verification, sending signature and message directly to chain. */
onChainAuthenticationButton.addEventListener('click', async () => {
    if (signer && connectedWalletAddress) {
        const apiProvider = new ethers.providers.JsonRpcProvider(apiURL);
        const contract = new ethers.Contract(contractAddress, contractABI, apiProvider);
    
        // Use epoch in the data to be signed to prevent replay attacks. 
        const message = `${Date.now()}`;
        /* Get the hash of epoch to not make visible the data to be sent to the chain. */
        const messageHash = ethers.utils.id(message);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
        signatureResult.textContent = `Signed Message: ${signature}`;
    
        // Call the smart contract
        try {
            const isAuthorized = await contract.verifyAndAuthorize(messageHash, signature);
            console.log('Is authorized:', isAuthorized);
            // Both authentication and authorization will be fetch from he chain at one go.
            if (isAuthorized) {
                verificationResult.textContent = 'Signature verified successfully';
                authorizationResult.textContent = 'Authorized.';
            } else {
                verificationResult.textContent = 'Verification failed!';
                authorizationResult.textContent = 'UnAuthorized!';
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

/* On-Chain stuff */
const API_KEY = "SET_YOUR_API_KEY_HERE";
/* Deployed on: Sepolia */
const contractAddress = '0x9fff571b67f72e22a6d37eb782bff2400add06d4';
const apiURL = "https://sepolia.infura.io/v3/" + API_KEY;

const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "authorizeAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isAuthorized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "revokeAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "verifyAndAuthorize",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
