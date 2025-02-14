var StellarSdk = require('@stellar/stellar-sdk');
const fetch = require('node-fetch');
global.fetch = fetch;

// Configure network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // Use testnet for development
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Replace with your Stellar account details
const sourceSecretKey = 'YOUR_SOURCE_ACCOUNT_SECRET_KEY';
const destinationPublicKey = 'DESTINATION_ACCOUNT_PUBLIC_KEY';
const amount = '10'; // Amount to send in XLM

// Create a keypair from the source secret key
const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);

// Create a transaction object
async function sendTransaction() {
try {
// Load source account
const account = await server.loadAccount(sourceKeypair.publicKey());

    // Create a payment operation
    const paymentOperation = StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount
    });

    // Create a transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase
    })
    .addOperation(paymentOperation)
    .setTimeout(30)
    .build();

    // Sign the transaction
    transaction.sign(sourceKeypair);

    // Submit the transaction
    const response = await server.submitTransaction(transaction);
    console.log('Transaction successful:', response);
} catch (error) {
    console.error('Transaction failed:', error);
}
}

// Run the function
sendTransaction();