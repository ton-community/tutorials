# TON Hello World part 1: Step by step guide for working with your first TON wallet

> by Tal Kol

The TON blockchain is [based](https://ton-blockchain.github.io/docs/ton.pdf) on the [TON coin](https://coinmarketcap.com/currencies/toncoin/) (previously labeled TonCoin). This cryptocurrency is used to pay for executing transactions (gas), much like ETH on the Ethereum blockchain. If you're participating in the TON ecosystem, most likely that you're already holding some TON and probably already have a wallet.

In this step by step tutorial, we will create a new TON wallet using one of the wallet apps and then try to access it programatically. This can be useful for example if you're planning on deploying a smart contract through code or writing a bot that receives and sends TON. We'll also understand how wallets work on TON and become comfortable with using them.

## Mainnet or testnet

There are two variations of the TON blockchain we can work on - *mainnet* and *testnet*. Mainnet is the real thing, where we would have to pay real TON coin in order to transact and staked validators would execute our transactions and guarantee a very high level of security - our wallet would be able to do dangerous things like holding large amounts of money without worrying too much.

Testnet is a testing playground where the TON coin isn't real and is available for free. Naturally, testnet doesn't offer any real security so we would just use it to practice and see that our code is behaving as expected.

Testnet is often appealing to new developers because it's free, but experience shows that mainnet is actually more cost effective. Since testnet is a simulated environment, it requires special wallets, doesn't always behave like the real thing and is more prone to flakiness and random errors.

Since TON transactions are very cheap, about 1 cent per transaction, investing just $5 will be enough for hundreds of transactions. If you decide to work on mainnet you will have a significantly smoother experience. The time you save will definitely be worth more than the $5 you spent.

## Step 1: Create a new wallet using an app

The simplest way to create a TON wallet is visit https://ton.org/wallets and choose one of the wallet apps from the list. This page explains the difference between custodial and non-custodial wallets. With a non-custodial wallet, you own the wallet and hold its private key by yourself. With a custodial wallet, you trust somebody else to do this for you.

The point of blockchain is being in control of your own funds, so we'll naturally choose a non-custodial option. They're all pretty similar, let's choose [TonKeeper](https://tonkeeper.com). Go ahead and install the TonKeeper app on your phone and run it.

TonKeeper works by default on TON mainnet. If you decided to work on testnet, you will need to switch the app manually to dev mode. Open the "Settings" tab and tap 5 times quickly on the Version number on the bottom. The "Dev Menu" should show up. Click on "Switch to Testnet" and make the switch. You can use this menu later to return to mainnet.

If you don't already have a wallet connected to the app, tap on the "Set up wallet" button. We're going to create a new wallet. After a few seconds, your wallet is created and TonKeeper displays your recovery phrase - the secret 24 words that give access to your wallet funds.

## Step 2: Backup the 24 word recovery phrase

The recovery phrase is the key to accessing your wallet. Lose this phrase and you'll lose access to your funds. Give this phrase to somebody and they'll be able to take your funds. Keep this secret and backed up in a safe place.

Why 24 words? The OG crypto wallets, like Bitcoin in its early days, did not use word phrases, they used a bunch of random looking letters to specify your key. This didn't work so well because of typos. People would make a mistake with a single letter and not be able to access their funds. The idea behind words was to eliminate these mistakes and make the key easier to write down. These phrases are also called "mnemonics" because they act as [mnemonic](https://en.wikipedia.org/wiki/Mnemonic) devices that make remembering them easier for humans.

## Step 3: View the wallet by address in an explorer

If you click on the top left in the TonKeeper app you will copy your wallet address. Alternatively, you can tap on the "Receive" button and see your wallet address displayed on screen.

It should look something like this:

```
kQCJRglfvsQzAIF0UAhkYH6zkdGPFxVNYMH1nPTN_UpDqEFK
```

This wallet address isn't secret. You can share it with anyone you want and they won't be able to touch your funds. If you want anyone to send you some TON, you will need to give them this address. You should be aware though of some privacy matters. Wallet addresses in TON and most blockchains are [pseudo-anonymous](https://en.wikipedia.org/wiki/Pseudonymization), this means that they don't reveal your identity in the real world. If you tell somebody your address and they know you in the real world, they can now make the connection.

An explorer is a tool that allows you to query data from the chain and investigate TON addresses. There are many [explorers](https://ton.app/explorers) to choose from. We're going to use Tonscan. Notice that mainnet and testnet have different explorers because those are different blockchains.


The testnet version of Tonscan is available on https://testnet.tonscan.org - open it and input your wallet address.

If this wallet is indeed new and hasn't been used before, its Tonscan page should show "State" as "Inactive". When you look under the "Contract" tab, you should see the message "This address doesn't contain any data in blockchain - it was either never used or the contract was deleted."

<img src="https://i.imgur.com/r1POqo9.png" width=600 /><br>

Wallets in TON are also smart contracts! What this message means is that this smart contract hasn't been deployed yet and is therefore uninitialized. Deploying a smart contract means uploading its code onto the blockchain.

Another interesting thing to notice is that the address shown in Tonscan may be different from the addres you typed in the search bar. There are multiple ways to encode the same TON address. You can use https://ton.org/address to see some additional representations and verify that they all share the same HEX public key.

## Step 4: Fund and deploy your wallet contract

As you can see in the explorer, the TON balance of our wallet is currently zero. We will need to fund our wallet by asking somebody to transfer some TON coins to our address. But wait... isn't this dangerous? How can we transfer some coins to the smart contract before it is deployed?

It turns out that this isn't a problem on TON. The TON blockchain maintains a list of accounts by address and stores the TON coin balance per address. Since our wallet smart contract has an address, it can have a balance, even before it has been deployed. Let's send 2 TON to our wallet address.

When using testnet, TON coins can be received for free. Using Telegram messenger, open the faucet https://t.me/testgiver_ton_bot and request some coins from the bot by providing your wallet address.

Refresh the explorer after the coins have been sent. As you can see, the balance of the smart contract is now 2 TON. And the "State" remains "Inactive", meaning it still hasn't been deployed.

<img src="https://i.imgur.com/OdIRwvo.png" width=600 /><br>

So when is your wallet smart contract being deployed? This would normally happen when you execute your first transaction - normally an outgoing transfer. This transaction is going to cost gas, so your balance cannot be zero to make it. TonKeeper is going to deploy our smart contract automatically when we issue the first transfer. Let's send 0.01 TON somewhere through TonKeeper.

Refresh the explorer after approving the transaction. We can see that TonKeeper indeed deployed our contract! The "State" is now "Active". The contract is no longer uninitialized and shows "wallet v4 r2" instead. Your contract may show a different version if TonKeeper was updated since this tutorial was written.

<img src="https://i.imgur.com/P9uuKaU.png" width=600 /><br>

We can also see that we've also paid some gas for the deployment and transfer fees. After sending 0.01 TON we have 1.9764 TON remaining, meaning we paid a total of 0.0136 TON in fees, not too bad.

## Step 5: Inspect the version of the wallet contract

The explorer shows that "Contract Type" is "wallet v4 r2" (or possibly a different version if your TonKeeper was since updated). This refers to the version of our smart contract code. If our wallet smart contract was deployed with "v4" as its code, this means somewhere must exist "v1", "v2" and "v3".

This is indeed correct. Over time, the TON core team has [published](https://github.com/toncenter/tonweb/blob/master/src/contract/wallet/WalletSources.md) multiple versions of the wallet contract code. We can see that TonKeeper has chosen to rely on v4. If you're interested, the source code for this wallet is [available here](https://github.com/ton-blockchain/wallet-contract/tree/v4r2-stable).

Let's look at this well known wallet address of [TON Foundation](https://tonscan.org/address/EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N). As you can see, it uses "wallet v3 r2" for its code. It was probably deployed before v4 was released.

<img src="https://i.imgur.com/xsZbZ5X.png" width=600 /><br>

Is it possible for the same secret mnemonic to have multiple wallets deployed with different versions? Definitely! This means that the same user may have multiple different wallets, each with its own unique address. This can get confusing. The next time you try to access your wallet using your secret mnemonic and you see a different address than you expect and a balance of zero, don't be alarmed. Nobody stole your money, you are probably just looking at the wrong wallet version.

## Step 6: Set up your local machine for coding

We're about to use code to access our wallet programatically. Before we can start writing code, we need to install certain developer tools on our computer.

The libraries we're going to rely on are implemented in JavaScript. Accordingly, our scripts will be executed by an engine called Nodejs. The installation instructions are [here](https://nodejs.org/). We will need a fairly recent version of node like v16 or v17. You can verify your nodejs version by running `node -v` in terminal.

For a choice of IDE, you will need anything that has decent TypeScript support. I recommend [Visual Studio Code](https://code.visualstudio.com) - it's free and open source.

Let's create a new directory for our project and initialize it. Open terminal in the project directory and run the following:

```
npm init es6 --yes
```


Next, we're going to install a JavaScript package named [TonWeb](https://github.com/toncenter/tonweb) that will allow us to make TON API calls and manipulate TON objects. Install the package by opening terminal in the project directory and running:

```
npm install tonweb tonweb-mnemonic
```

## Step 7: Get the wallet address programatically

The first thing we'll do is calculate the address of our wallet in code and see that it matches what we saw in the explorer. This action is completely offline since the wallet address is derived from the version of the wallet and the private key used to create it.

Let's assume that your secret 24 word mnemonic is `unfold sugar water ...` - this is the phrase we backed up in step 2.

Create the file `read.js` with the following content:


```ts
import tonMnemonic from "tonweb-mnemonic";
import TonWeb from "tonweb";

const mnemonic = "unfold sugar water ..."; // your 24 secret words (replace ... with the rest of the words)
const key = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));

const tonweb = new TonWeb();
const WalletClass = tonweb.wallet.all["v4R2"]; // notice the correct wallet version here
const wallet = new WalletClass(undefined, {
  publicKey: key.publicKey
});

const walletAddress = await wallet.getAddress();
console.log(walletAddress.toString(true, true, true));
```

To see the wallet address, run it using terminal:

```
node read.js
```

## Step 8: Read wallet state from the chain

