import StellarSdk from 'stellar-sdk';


// Configure the Stellar network (testnet)
// const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const server = new StellarSdk.Server('https://horizon.stellar.org');



// Your issuer account from Stellar Lab
const issuerSecret = 'SBZDPDOVKEVQ2TTC2OQ5NLAWM3DYZSBHKDNKGFHPMZIB3QUU3TWSA7TA';
const issuerPublic = 'GCG2PFAIBUKXC3VDGWY5JDYCC65YMO43ERHFHW5ZOOQIGDNCLPZL7NUO';

async function createToken(assetCode) {
    try {
        // Create keypair from your secret key
        const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecret);

        // Create a new distributor account for testing
        const distributorKeypair = StellarSdk.Keypair.random();

        // Fund the distributor account using friendbot (testnet only)
        await fetch(`https://friendbot.stellar.org?addr=${distributorKeypair.publicKey()}`);

        // Load account details
        const issuerAccount = await server.loadAccount(issuerPublic);
        const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());

        // Create the custom asset
        const customToken = new StellarSdk.Asset(assetCode, issuerPublic);

        // Create trust line transaction
        const trustLineTransaction = new StellarSdk.TransactionBuilder(distributorAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
            .addOperation(StellarSdk.Operation.changeTrust({
                asset: customToken,
                limit: '1000000' // Maximum amount the distributor can hold
            }))
            .setTimeout(180)
            .build();

        // Sign and submit trust line transaction
        trustLineTransaction.sign(distributorKeypair);
        await server.submitTransaction(trustLineTransaction);

        // Create payment transaction to send initial tokens
        const paymentTransaction = new StellarSdk.TransactionBuilder(issuerAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: distributorKeypair.publicKey(),
                asset: customToken,
                amount: '1000' // Initial amount to send
            }))
            .setTimeout(180)
            .build();

        // Sign and submit payment transaction
        // paymentTransaction.sign(issuerKeypair);
        // const result = await server.submitTransaction(paymentTransaction);

        // return {
        //     success: true,
        //     tokenDetails: {
        //         assetCode: assetCode,
        //         issuer: issuerPublic,
        //         distributor: distributorKeypair.publicKey(),
        //     },
        //     distributorSecret: distributorKeypair.secret(), // Save this securely!
        //     transactionHash: result.hash
        // };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}


function createTokenAsset(assetCode) {
    try {
        // Create the custom asset
        const customToken = new StellarSdk.Asset(assetCode, issuerPublic);

        return {
            success: true,
            asset: {
                code: assetCode,
                issuer: issuerPublic,
                assetString: `${assetCode}:${issuerPublic}`
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}


async function createDestinationAccount() {
    // Generate a new keypair for the destination
    const destinationKeypair = StellarSdk.Keypair.random();

    // Fund the account using friendbot
    await fetch(
        `https://friendbot.stellar.org?addr=${destinationKeypair.publicKey()}`
    );

    return {
        publicKey: destinationKeypair.publicKey(),
        secretKey: destinationKeypair.secret()
    };
}


async function createTrustline(destinationSecret, assetCode) {
    const destinationKeypair = StellarSdk.Keypair.fromSecret(destinationSecret);
    const destinationAccount = await server.loadAccount(destinationKeypair.publicKey());

    // Create the custom asset
    const customToken = new StellarSdk.Asset(assetCode, issuerPublic);

    // Create trustline transaction
    const transaction = new StellarSdk.TransactionBuilder(destinationAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
    })
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: customToken,
            limit: '1000000' // Maximum amount they can hold
        }))
        .setTimeout(180)
        .build();

    // Sign and submit
    transaction.sign(destinationKeypair);
    return server.submitTransaction(transaction);
}


async function sendToken(assetCode, destinationAddress, amount) {
    try {
        const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecret);
        const customToken = new StellarSdk.Asset(assetCode, issuerPublic);
        const issuerAccount = await server.loadAccount(issuerPublic);

        const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: destinationAddress,
                asset: customToken,
                amount: amount.toString()
            }))
            .setTimeout(180)
            .build();

        transaction.sign(issuerKeypair);
        const result = await server.submitTransaction(transaction);

        return {
            success: true,
            transactionHash: result.hash,
            details: {
                from: issuerPublic,
                to: destinationAddress,
                asset: assetCode,
                amount: amount
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}


const checkBalance = async (publicKey) => {
    try {
        const account = await server.loadAccount(publicKey);
        console.log('Account Details:', account);
        console.log('Balances:', account.balances);
    } catch (error) {
        console.error('Error loading account:', error);
    }
};

//create token
//console.log("CREATING ASSET TOKEN", createTokenAsset("MYxvxxTOKEN"))
//create destination account
// const destination = await createDestinationAccount();
// console.log('Destination account created:', destination);

//create a trustline
// await createTrustline(destination.secretKey, 'MYxvxxTOKEN');

//send tokens

// console.log('Sending tokens...');
// const result = await sendToken('MYxvxxTOKEN', destination.publicKey, '1000');
// console.log('Transaction result:', result);

await checkBalance("GAIWUNGTRUPNBGESJFE7674MHW5PFJR524EUOJ357EQH3O7I2ZFWNNQD");

// Usage example
// async function main() {
//     const result = await createToken('MYXYTOKEN');
//     console.log(result);
// }

// public key = GCG2PFAIBUKXC3VDGWY5JDYCC65YMO43ERHFHW5ZOOQIGDNCLPZL7NUO
//secretkey = SBZDPDOVKEVQ2TTC2OQ5NLAWM3DYZSBHKDNKGFHPMZIB3QUU3TWSA7TA
//link https://stellar.expert/explorer/testnet/account/GCG2PFAIBUKXC3VDGWY5JDYCC65YMO43ERHFHW5ZOOQIGDNCLPZL7NUO

// main();

// console.log(createTokenAsset("MYX2YTOKEN"))