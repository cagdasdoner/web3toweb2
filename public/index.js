const connectWalletButton = document.getElementById('connectWallet');
const disconnectWalletButton = document.getElementById('disconnectWallet');
const walletAddressDisplay = document.getElementById('walletAddress');
const signatureResult = document.getElementById('signatureResult');
const serverAuthenticationButton = document.getElementById('serverAuthentication');

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

serverAuthenticationButton.addEventListener('click', async () => {
    if (signer && connectedWalletAddress) {
        try {
            // Use epoch in the data to be signed to prevent replay attacks.
            const message = `${Date.now()}`;
            const signature = await signer.signMessage(message);
            signatureResult.textContent = `Signed Message: ${signature}`;

            // Send the signature and message to the server for verification
            fetch('/verifySignature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, signature, address: connectedWalletAddress }),
            })
            .then(response => response.json())
            .then(data => {
                const verificationResult = document.getElementById('verificationResult');
                if (data.success) {
                    verificationResult.textContent = 'Signature verified successfully';
                    const authorizationResult = document.getElementById('authorizationResult');
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
