import StellarSdk from 'stellar-sdk';

// Use the Testnet (sandbox) network
// StellarSdk.Network.useTestNetwork();

// Initialize the Horizon server
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');


// Generate a new keypair
const keypair = StellarSdk.Keypair.random();

// Extract public and secret keys
const publicKey = keypair.publicKey();
const secretKey = keypair.secret();

console.log('Public Key:', publicKey);
console.log('Secret Key:', secretKey);


const fundAccount = async () => {
    try {
        const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
        const data = await response.json();
        console.log('Friendbot Response:', data);
    } catch (error) {
        console.error('Error funding account:', error);
    }
};

// fundAccount();



const checkBalance = async () => {
    try {
        const account = await server.loadAccount(publicKey);
        console.log('Account Details:', account);
        console.log('Balances:', account.balances);
    } catch (error) {
        console.error('Error loading account:', error);
    }
};

// checkBalance();


const recipientKeypair = StellarSdk.Keypair.random();
const recipientPublicKey = recipientKeypair.publicKey();
console.log('Recipient Public Key:', recipientPublicKey);


const fundRecipient = async () => {
    try {
        const response = await fetch(`https://friendbot.stellar.org/?addr=${recipientPublicKey}`);
        const data = await response.json();
        console.log('Recipient Funded:', data);
    } catch (error) {
        console.error('Error funding recipient:', error);
    }
};

// fundRecipient();


const sendPayment = async () => {
    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(publicKey);

        // Build the transaction
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: recipientPublicKey,
                asset: StellarSdk.Asset.native(), // Native asset (XLM)
                amount: '10', // Send 10 XLM
            }))
            .setTimeout(30) // Transaction valid for 30 seconds
            .build();

        // Sign the transaction with the source account's secret key
        transaction.sign(keypair);

        // Submit the transaction to the network
        const result = await server.submitTransaction(transaction);
        console.log('Payment Successful:', result);
    } catch (error) {
        console.error('Error sending payment:', error);
    }
};

// sendPayment();

fundAccount()