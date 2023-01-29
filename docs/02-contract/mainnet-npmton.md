
# TON Hello World part 2: Step by step guide for writing your first smart contract

A smart contract is simply a computer program running on TON blockchain - or more exactly its [TVM](https://ton-blockchain.github.io/docs/tvm.pdf) (TON Virtual Machine). The contract is made of code (compiled TVM instructions) and data (persistent state) that are stored in some address on the TON blockchain.

In the world of blockchain, *code is law*, meaning that instead of lawyers and papers, computer instructions define in absolute terms the rules of interaction between the different users of the contract. Before enagaging with any smart contract as a user, you're expected to review its code and thus understand its terms of agreement. Accordingly, we'll make an effort to make our contract as easy to read as possible, so its users could understand what they're getting into.

## Dapps - decentralized applications

Smart contracts are a key part of *decentralized apps* - a special type of application invented in the blockchain era, that does not depend on any single entity to run it. Unlike the app Uber, for example, which depends on the company Uber Inc to run it - a *decentralized Uber* would allow riders and drivers to interact directly (order, pay for and fulfill rides) without any intermediary like Uber Inc. Dapps are also unstoppable - if we don't depend on anyone specific to run them, nobody can take them down.

Dapps on TON blockchain are usually made of 2 main projects:

* Smart contracts in the [FunC](https://ton.org/docs/develop/func/overview) programming language that are deployed on-chain - these act as the *backend server* of the app, with a *database* for persistent storage.

* Web frontend for interacting with the dapp from a web browser - this acts as the *frontend* or *client*, normally with special support for Telegram messenger in the form of a [Telegram Web App](https://core.telegram.org/bots/webapps).

Throughout this series of tutorials, we will build a full dapp together and see detailed implementations of both projects.

## Step 1: Define our first smart contract

So what are we going to build? Our smart contract will be quite simple:

Its main feature is to hold a *counter*. The counter will start at some number, and allow users to send *increment* transactions to the contract, which will in turn increase the counter value by 1. The contract will also have a getter function that will allow any user to query the current value of the counter.

In later tutorials we will make this contract a little more advanced and allow TON coins that are deposited in it to be withdrawn by a special admin role. This admin will also be able to transfer ownership to a different admin and more.

## Step 2: Set up your local machine

Before we can start writing code, we need to install certain developer tools on our computer.

For convenience, our development environment will rely on several clever scripts for testing, compiling and deploying our code. The most convenient language for these scripts is JavaScript, executed by an engine called Nodejs. The installation instructions are [here](https://nodejs.org/). We will need a fairly recent version of node like v16 or v17. You can verify your nodejs version by running `node -v` in terminal.

You will also need a decent IDE with FunC and TypeScript support. I recommend [Visual Studio Code](https://code.visualstudio.com/) - it's free and open source. Also install the [FunC Plugin](https://marketplace.visualstudio.com/items?itemName=tonwhales.func-vscode) to add syntax highlighting for the FunC language.

## Step 3: Set up the project

Let's create a new directory for our project. Open terminal in the project directory and run the following:

```console
npm install ts-node
```

This will allow us to easily run TypeScript files. Now run in terminal:

```console
npm install @ton-community/func-js
```

This will install the package [func-js](https://github.com/ton-community/func-js), a cross-platform compiler for FunC.

> In previous iterations of this tutorial we used to deal with [binaries executables](https://github.com/ton-defi-org/ton-binaries) of the `func` and `fift` compilers, but those were platform specific (different binaries for Mac, Windows and Linux). Relying on func-js will make life easier since it's cross-platform. In general, using executable binaries in the TON ecosystem is obsolete.

And finally, run in terminal:

```console
npm install ton ton-crypto ton-core
```

This will install a library that you should be familiar with - [ton](https://www.npmjs.com/package/ton). We'll use it to deploy our contract and interact with it.

## Step 4: Structuring our smart contract

Much like everything else in life, smart contracts in FunC are divided into 3 sections. These sections are: *storage*, *messages* and *getters*.

The **storage** section deals with our contract's persistent data. Our contract will have to store data between calls from different users, for example the value of our *counter* variable. To write this data to state storage, we will need a write/encode function and to read this data back from state storage, we will need a read/decode function.

The **messages** section deals with messages sent to our contract. The main form of interaction with contracts on TON blockchain is by sending them messages. We mentioned before that our contract will need to support a variety of actions like *increment*, *deposit*, *withdraw* and *transfer ownership*. All of these operations are performed by users as transactions. These operations are not read-only because they change something in the contract's persistent state.

The **getters** section deals with read-only interactions that don't change state. For example, we would want to allow users to query the value of our *counter*, so we can implement a getter for that. We've also mentioned that the contract has a special *owner*, so what about a getter to query that. Since our contract can hold money (TON coins), another useful getter could be to query the current balance.

## Step 5: Implement the Counter contract

We're about to write our first lines in FunC! Our first task would be to implement the *counter* feature of our contract.

The FunC programming language is very similar to the [C language](https://en.wikipedia.org/wiki/C_(programming_language)). It has strict types, which is a good idea, since compilation errors will help us spot contract mistakes early on. The language was designed specifically for TON blockchain, so you will not find a lot of documentation beyond the [official FunC docs](https://ton.org/docs/develop/func/overview).

### Storage

Let's start with the first section, *storage*, and implement two utility functions (which we will use later) for reading and writing variables to the contract's persistent state - `load_data()` and `save_data()`. The primary variable will be the counter value. We must persist this value to storage because we need to remember it between calls. The appropriate type for our counter variable is `int`. Notice [in the docs](https://ton.org/docs/develop/func/types#atomic-types) that the `int` TVM runtime type is always 257 bit long (256 bit signed) so it can hold huge huge numbers - I'm pretty sure the universe has less than 2^256 atoms in it, so you'll never have a number so large that you can't fit in it. Storing the full 257 bits in blockchain storage is somewhat wasteful because the contract pays rent proportionally to the total amount of data it keeps. To optimize costs, let's keep in persistent storage just the lowest 64 bits - capping our counter's maximum value at 2^64 which should be enough:

```func
(int) load_data() inline {                 ;; read function declaration - returns int as result
  var ds = get_data().begin_parse();       ;; load the storage cell and start parsing as a slice
  return (ds~load_uint(64));               ;; read a 64 bit unsigned int from the slice and return it
}

() save_data(int counter) impure inline {  ;; write function declaration - takes an int as arg
  set_data(begin_cell()                    ;; store the storage cell and create it with a builder 
    .store_uint(counter, 64)               ;; write a 64 bit unsigned int to the builder
    .end_cell());                          ;; convert the builder to a cell
}
```

The standard library functions `get_data()` and `set_data()` are documented [here](https://ton.org/docs/develop/func/stdlib#persistent-storage-save-and-load) and load/store the storage cell. We will cover [*cells*](https://ton.org/docs/develop/func/types#atomic-types) in detail in future posts of this series. Cells are read from using the [*slice*](https://ton.org/docs/develop/func/types#atomic-types) type (an array of bits) and written to using the [*builder*](https://ton.org/docs/develop/func/types#atomic-types) type. The various methods that you see are all taken from the [standard library](https://ton.org/docs/develop/func/stdlib). Also notice two interesting function modifiers that appear in the declarations - [*inline*](https://ton.org/docs/develop/func/functions#inline-specifier) and [*impure*](https://ton.org/docs/develop/func/functions#impure-specifier).

### Messages

Let's continue to the next section, *messages*, and implement the main message handler of our contract - `recv_internal()`. This is the primary entry point of our contract. It runs whenever a message is sent as a transaction to the contract by another contract or by a user's wallet contract:

```func
() recv_internal(int msg_value, cell in_msg, slice in_msg_body) impure {  ;; well known function signature
  if (in_msg_body.slice_empty?()) {         ;; check if incoming message is empty (with no body)
    return ();                              ;; return successfully and accept an empty message
  }
  int op = in_msg_body~load_uint(32);       ;; parse the operation type encoded in the beginning of msg body
  var (counter) = load_data();              ;; call our read utility function to load values from storage
  if (op == 1) {                            ;; handle op #1 = increment
    save_data(counter + 1);                 ;; call our write utility function to persist values to storage
  }
}
```

Messages sent between contracts are called [internal messages](https://ton.org/docs/develop/smart-contracts/guidelines/internal-messages). TON also supports [external messages](https://ton.org/docs/develop/smart-contracts/messages) through the handler `recv_external()`, but as a dapp developer you're never expected to use them. External messages are used for very specific cases, mainly when implementing wallet contracts, that you would normally never have to write by yourself. You can safely ignore them.

Internal messages received by the contract may be empty. This is what happens for example when somebody sends TON coins to the contract from their wallet. This is useful for funding the contract so it can pay fees. In order to be able to receive those incoming transfers we will have to return successfully when an empty message arrives.

If an incoming message is not empty, the first thing to do is read its operation type. By convention, internal messages are [encoded](https://ton.org/docs/develop/smart-contracts/guidelines/internal-messages) with a 32 bit unsigned int in the beginning that acts as operation type (op for short). We are free to assign any serial numbers we want to our different ops. In this case, we've assigned the number `1` to the *increment* action, which is handled by writing back to persistent state the current value counter plus 1.

### Getters

Our last section, as you recall, is *getters*. Let's implement a simple getter that will allow users to query the counter value:

```func
int counter() method_id {        ;; getter declaration - returns int as result
  var (counter) = load_data();   ;; call our read utility function to load value
  return counter;
}
```

We can choose what input arguments the getter takes as input and what output it returns as result. Also notice the function modifier appearing in the declaration - [*method_id*](https://ton.org/docs/develop/func/functions#method_id). It is customary to place `method_id` on all getters.

That's it. We completed our 3 sections and the first version of our contract is ready. To get the complete code, simply concat the 3 snippets above to a single file named `counter.fc` and save it. This will be the FunC (`.fc` file extension) source file of our contract. The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/02-contract/test/counter.fc).

## Step 6: Build the counter contract

Right now, the contract is just FunC source code. To get it to run on-chain, we need to convert it to TVM [bytecode](https://ton.org/docs/learn/tvm-instructions/instructions). 

In TON, we don't compile FunC directly to bytecode, but instead go through another programming language called [Fift](https://ton-blockchain.github.io/docs/fiftbase.pdf). Just like FunC, Fift is another language that was designed specifically for TON blockchain. It's a low level language that is very close to TVM opcodes. For us regular mortals, Fift is not very useful, so unless you're planning on some extra advanced things, I believe you can safely ignore it for now.

The func-js package contains everything we need to compile our contract to bytecode. To use it, open terminal in the project directory and run the following:

```console
npx func-js counter.fc --boc counter.cell
```

You'll notice that we immediately get a bunch of compilation errors on some function definitions missing like `set_data` and `begin_cell`. **It's good practice to see what compilation errors look like.** Indeed, our code relies on these standard library functions, but where are they defined? The TON foundation publishes these in the main TON repo in the file [stdlib.fc](https://github.com/ton-blockchain/ton/blob/master/crypto/smartcont/stdlib.fc). Since I've seen multiple versions of this file running around, it's good practice to download it and include it as part of your project.

Download [stdlib.fc](https://raw.githubusercontent.com/ton-blockchain/ton/master/crypto/smartcont/stdlib.fc) and save it in the project directory. 

The func-js compiler supports taking multiple input files as arguments. Note that order matters in this case, so `stdlib.fc` needs to be appear before `counter.fc` which relies on it:

```console
npx func-js stdlib.fc counter.fc --boc counter.cell
```

The build should now succeed, with the output of this command being a new file - `counter.cell`. This is a binary file that finally contains the TVM bytecode in cell format that is ready to be deployed on-chain. This will actually be the only file we need for deployment moving forward (we won't need the FunC source file).

## Step 7: Prepare init data for deploying on-chain

Now that our contract has been compiled to bytecode, we can finally see it in action running on-chain. The act of uploading the bytecode to the blockchain is called *deployment*. The deployment result would be an address where the contract resides. This address will allow us to communicate with this specific contract instance later on and send it transactions.

There are two variations of the TON blockchain we can deploy to - *mainnet* and *testnet*. We covered both in the previous tutorial. Personally, I almost never deploy to testnet. There are far better ways to gain confidence that my code is working as expected. The primary of which is writing a dedicated *test suite*. We will cover this in detail in one of the next tutorials. For now, let's assume the code is working perfectly and no further debugging is required.

### Init arguments

The new address of our deployed contract in TON depends on only two things - the deployed bytecode (initial code) and the initial contract storage (initial data). You can say that the address is some derivation of the hash of both. If two different developers were to deploy the exact same code with the exact same initialization data, they would collide.

The bytecode part is easy, we have that ready as a cell in the file `counter.cell` that we compiled in step 6. Now what about the initial contract storage? As you recall, the format of our persistent storage data was decided when we implemented the function `save_data()` of our contract FunC source. Our storage layout was very simple - just one unsigned int of 64 bit holding the counter value. Therefore, to initialize our contract, we would need to generate a data cell holding some arbitrary initial uint64 value - for example the number `1`.

### Interface class

The recommended way to interact with contracts is to create a small TypeScript class that will implement the interaction interface with the contract. We would normally give it the same name, so create the file `counter.ts` and place it next to the FunC source `counter.fc`.

Use the following code in `counter.ts` to create the initial data cell for deployment:

```ts
import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell } from "ton-core";

export default class Counter implements Contract {

  static createForDeploy(code: Cell, initialCounterValue: number): Counter {
    const data = beginCell()
      .storeUint(initialCounterValue, 64)
      .endCell();
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    return new Counter(address, { code, data });
  }
  
  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}
}
```

Notice a few interesting things about this TypeScript code. First, it depends on the package [ton-core](https://www.npmjs.com/package/ton-core) instead of [ton](https://www.npmjs.com/package/ton), which contains a small subset of base types and is therefore slower to change - an important feature when building a stable interface for our contract. Second, the code that creates the data cell mimics the FunC API and is almost identical to our `save_data()` FunC function. Third, we can see the derivation of the contract address from the code cell and data cell using the function `contractAddress`.

The actual deployment involves sending the first message that will cause our contract to be deployed. We can piggyback any message that is directed towards our contract. This can even be the increment message with op #1, but we will do something simpler. We will just send some TON coins to our contract (an empty message) and piggyback that. Let's make this part of our interface. Add the function `sendDeploy()` to `counter.ts` - this function will send the deployment message:

```ts
// export default class Counter implements Contract {

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.01", // send 0.01 TON to contract for rent
      bounce: false
    });
  }

// }
```

In every deployment we need to send some TON coins to our contract so that its balance is not zero. Contracts need to continually pay rent fees otherwise they risk being deleted. According to the [docs](https://ton.org/docs/develop/smart-contracts/fees#storage-fee), storage fees are about 4 TON per MB per year. Since our contract stores less than 1 KB, a balance of 0.01 TON should be enough for more than 2 years. In any case you can always check this in an explorer and send more TON to the contract if it runs low.

The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/02-contract/test/counter.step7.ts).

## Step 8: Deploy the contract on-chain

Communicating with the live network for the deployment will require an RPC service provider - similar to [Infura](https://infura.io) on Ethereum. These providers run TON blockchain nodes and allow us to communicate with them over HTTP. [TON Access](https://orbs.com/ton-access) is an awesome service that will provide us with unthrottled API access for free. It's also decentralized, which is the preferred way to access the network.

Install it by opening terminal in the project directory and running:

```console
npm install @orbs-network/ton-access
```

The deployment is going to cost gas and should be done through a wallet that will fund it. I'm assuming that you have some familiarity with TON wallets and how they're derived from 24 word secret mnemonics. If not, be sure to follow the previous tutorial in this series.

As you recall from the previous tutorial, TON wallets can come in multiple versions. The code below relies on "wallet v4 r2", if your wallet is different, either switch [TonKeeper](https://tonkeeper.com) through "Settings" to this version, or modify the code to use your version. Also remember to use a wallet works with the correct network you've chosen - testnet or mainnet.

Create a new script `deploy.ts` that will use the interface class we just wrote:

```ts
import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV4 } from "ton";
import Counter from "./counter"; // this is the interface class from step 7

async function deploy() {
  // initialize ton rpc client on mainnet
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  // prepare Counter's initial code and data cells for deployment
  const counterCode = Cell.fromBoc(fs.readFileSync("counter.cell"))[0]; // compilation output from step 6
  const initialCounterValue = Date.now(); // to avoid collisions use current number of milliseconds since epoch as initial value
  const counter = Counter.createForDeploy(counterCode, initialCounterValue);
  
  // exit if contract is already deployed
  console.log("contract address:", counter.address.toString());
  if (await client.isContractDeployed(counter.address)) {
    return console.log("already deployed");
  }

  // open wallet v4 (notice the correct wallet version here)
  const mnemonic = "unfold sugar water ..."; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();
  
  // send the deploy transaction
  const counterContract = client.open(counter);
  await counterContract.sendDeploy(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("deploy transaction confirmed!");
}

deploy();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

Before running this code, make sure you have enough TON in your wallet for the gas payments and the TON sent to the contract during the deploy.

Another thing to watch out for is collisions between different users of this tutorial. As you recall, if the code and initial data of two contracts are identical, they will have the same address. If all followers of this tutorial would choose initial counter value of `1` - then all of them would collide and only the first would actually deploy the contract. To make sure this doesn't happen, the code above initializes the counter value to the current number of milliseconds since the epoch (something like 1674253934361). This guarantees that your contract for deployment is unique.

To run `deploy.ts` use terminal once again:

```console
npx ts-node deploy.ts
```

If you have network connectivity issues and get errors like backend nodes unhealthy or timeouts, please join the [Telegram support chat](https://t.me/TONAccessSupport) for TON access to get assistance.

The script will print the newly deployed contract address - mine is `EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb`. You can open your address in an [explorer](https://tonscan.org) to verify that the deploy went smoothly. This is what it should look like:

<img src="https://i.imgur.com/SLR7nmE.png" width=600 /><br>

Write down your deployed contract address. We're going to use it in the next step.

## Step 9: Call a getter on the deployed contract

There are two ways to interact with a smart contract - calling a getter to read data from it or sending a message that can potentially change its state (write). We should support these interactions in the contract interface class that we created in step 7.

Anyone who wants to access the contract from TypeScript would simply use this interface class. This is excellent for separation of responsibilities within your team. The developer of the contract can provide this class to the developer of the client to abstract away implementation details such as how messages should be encoded in the binary level. Let's start with the getter.

### Interface class

Add the following to `counter.ts`:

```ts
// export default class Counter implements Contract {

  async getCounter(provider: ContractProvider) {
    const { stack } = await provider.get("counter", []);
    return stack.readBigNumber();
  }

// }
```

Notice that methods in the interface class that call getters must start with the word `get`. This prefix is a requirement of the [ton](https://www.npmjs.com/package/ton) TypeScript library. The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/02-contract/test/counter.step9.ts).

### Executing the call

Calling a getter is free and does not cost gas. The reason is that this call is read-only, so it does not require consensus by the validators and is not stored in a block on-chain for all eternity like transaction are.

Let's create a new script `step9.ts` and use our shiny interface class to make the call. We're going to emulate a different developer interacting with our contract and since the contract is already deployed, they are likely to access it by address. Be sure to replace my deployed contract address with yours in the code below:

```ts
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "ton";
import Counter from "./counter"; // this is the interface class we just implemented

async function main() {
  // initialize ton rpc client on mainnet
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  // open Counter instance by address
  const counterAddress = Address.parse("EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb"); // replace with your address from step 8
  const counter = new Counter(counterAddress);
  const counterContract = client.open(counter);

  // call the getter on chain
  const counterValue = await counterContract.getCounter();
  console.log("value:", counterValue.toString());
}

main();
```

As usual, run the script with terminal:

```console
npx ts-node step9.ts
```

Make a note of the current counter value. After we send the increment message in the next step we would like to confirm that this value indeed increases by 1.

Another intersting thing to remember is that getters are only accessible off-chain, for example from a JavaScript client making a call through an RPC service provider. In particular, this means that contracts cannot call getters on other contracts.

## Step 10: Send a transaction to the deployed contract

Unlike getters that are read-only, messages can write and change contract state in storage. In our contract implementation we handled messages in `recv_internal()` and assigned op #1 = *increment*. Sending messages costs gas and requires payment in TON coin. The reason is that this operation is not read-only, so it requires waiting for consensus by the validators and is stored as a transaction in a block on-chain for all eternity. We will send less TON coin this time since this action is much cheaper than the deployment.

### Interface class

Add the following to `counter.ts`:

```ts
// export default class Counter implements Contract {

  async sendIncrement(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(1, 32) // op (op #1 = increment)
      .storeUint(0, 64) // query id
      .endCell();
    await provider.internal(via, {
      value: "0.002", // send 0.002 TON for gas
      body: messageBody
    });
  }

// }
```

As you recall, the increment message is an [internal message](https://ton.org/docs/develop/smart-contracts/guidelines/internal-messages) that is encoded by convention with a 32 bit unsigned int in the beginning to describe the op and a 64 bit unsigned int after to describe the query id. The query id is relevant for messages that expect a response message to be sent back (the request and the response share the same query id).

Notice that methods in the interface class that send messages must start with the word `send`, another prefix requirement of the [ton](https://www.npmjs.com/package/ton) library. The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/02-contract/test/counter.step10.ts).

### Executing the send

The messages can be sent from any TON wallet, not necessarily the deployer wallet. Create a new script `step10.ts` and use your wallet to fund the send:

```ts
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, Address } from "ton";
import Counter from "./counter"; // this is the interface class we just implemented

async function main() {
  // initialize ton rpc client on mainnet
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  // open wallet v4 (notice the correct wallet version here)
  const mnemonic = "unfold sugar water ..."; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // open Counter instance by address
  const counterAddress = Address.parse("EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb"); // replace with your address from step 8
  const counter = new Counter(counterAddress);
  const counterContract = client.open(counter);

  // send the increment transaction
  await counterContract.sendIncrement(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

As usual, run the script with terminal:

```console
npx ts-node step10.ts
```

Notice that the message will take a few seconds to be processed by validators and will only change contract state after it has been processed. The normal wait time is a block or two, since validators need to produce a new block that contains our sent transaction. The op that was sent above is #1 = *increment*, which means that after processing, the counter value will increase by 1. Verify this by re-running the script from step 9 to print the new counter value.

Messeges can sent to our contract by other contracts. This means a different contract can increment our counter. This allows the TON ecosystem to create composable apps and protocols that build on top of each other and interact in unforeseen ways.

## Conclusion

For your convenience, all the code in this tutorial is available in executable form [here](https://github.com/ton-community/tutorials/blob/main/02-contract/test).

If you found a mistake in this tutorial, please [submit a PR](https://github.com/ton-community/tutorials/pulls) and help us fix it. This tutorial platform is fully open source and available on [https://github.com/ton-community/tutorials](https://github.com/ton-community/tutorials).

Happy coding!
