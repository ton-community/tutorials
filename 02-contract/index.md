
# TON Hello World part 2: Step by step guide for writing your first smart contract

A smart contract is simply a computer program running on TON blockchain - or more exactly its [TVM](https://ton-blockchain.github.io/docs/tvm.pdf) (TON Virtual Machine). The contract is made of code (compiled TVM instructions) and data (persistent state) that are stored in some address on the TON blockchain.

In the world of blockchain, *code is law*, meaning that instead of lawyers and papers, computer instructions define in absolute terms the rules of interaction between the different users of the contract. Before enagaging with any smart contract as a user, you're expected to review its code and thus understand its terms of agreement. Accordingly, we'll make an effort to make our contract as easy to read as possible, so its users could understand what they're getting into.

## Dapps - decentralized applications

Smart contracts are a key part of *decentralized apps* - a special type of application invented in the blockchain era, that does not depend on any single entity to run it. Unlike the app Uber, for example, which depends on the company Uber Inc to run it - a *decentralized Uber* would allow riders and drivers to interact directly (order, pay for and fulfill rides) without any intermediary like Uber Inc. Dapps are also unstoppable - if we don't depend on anyone specific to run them, nobody can take them down.

Dapps on TON blockchain are usually made of 2 main projects:

* Smart contracts in the [FunC](https://ton.org/docs/develop/func/overview) programming language that are deployed on-chain - these act as the "backend server" of the app, with a "database" for persistent storage

* Web frontend for interacting with the dapp from a web browser - this acts as the "frontend" or "client", normally with special support for Telegram messenger in the form of a [Telegram Web App](https://core.telegram.org/bots/webapps)

Throughout this series of tutorials, we will build a full dapp together and see detailed implementations of both projects.

## Step 1: Define our first smart contract

So what are we going to build? Our smart contract will be quite simple:

Its main feature is to hold a *counter*. The counter will start at some number, and allow users to send *increment* transactions to the contract, which will in turn increase the counter value by 1. The contract will also have a getter function that will allow any user to query the current value of the counter.

In later tutorials we will make this contract a little more advanced, allow TON coins to be deposited in it, introduce a special admin role that can withdraw the funds and more.

## Step 2: Set up your local machine

Before we can start writing code, we need to install certain developer tools on our computer.

For convenience, our development environment will rely on several clever scripts for testing, compiling and deploying our code. The most convenient language for these scripts is JavaScript, executed by an engine called Nodejs. The installation instructions are [here](https://nodejs.org/). We will need a fairly recent version of node like v16 or v17. You can verify your nodejs version by running `node -v` in terminal.

You will also need a decent IDE with FunC and TypeScript support. I recommend [Visual Studio Code](https://code.visualstudio.com/) - it's free and open source. Also install the [FunC Plugin](https://marketplace.visualstudio.com/items?itemName=tonwhales.func-vscode) to add syntax highlighting for the FunC language.

## Step 3: Set up the project

Let's create a new directory for our project. Open terminal in the project directory and run the following:

```
npm install ts-node
```

This will allow us to easily run TypeScript files. Now run in terminal:

```
npm install @ton-community/func-js
```

This will install the package [func-js](https://github.com/ton-community/func-js), a cross-platform compiler for FunC.

> In previous iterations of this tutorial we used to deal with [binaries executables](https://github.com/ton-defi-org/ton-binaries) of the `func` and `fift` compilers, but those were platform specific (different binaries for Mac, Windows and Linux). Relying on func-js will make life easier since it's cross-platform. In general, using executable binaries in the TON ecosystem is obsolete.

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
  int op = in_msg_body~load_uint(32);                                     ;; parse the operation type encoded in the beginning of msg body
  var (counter) = load_data();                                            ;; call our read utility function to load values from storage
  if (op == 1) {                                                          ;; handle op #1 = increment
    save_data(counter + 1);                                               ;; call our write utility function to persist values to storage
  }
}
```

As you can see, the first thing to do when parsing a new incoming message is to read its operation type. By convention, [internal messages](https://ton.org/docs/develop/smart-contracts/guidelines/internal-messages) are encoded with a 32 bit unsigned int in the beginning that acts as operation type (op for short). We are free to assign any serial numbers we want to our different ops. In this case, we've assigned the number `1` to the *increment* action, which is handled by writing back to persistent state the current value counter plus 1.

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

```
npx func-js counter.fc --boc counter.cell
```

You'll notice that we immediately get a bunch of compilation errors on some function definitions missing like `set_data` and `begin_cell`. It's good practice to see what compilation errors look like. Indeed, our code relies on these standard library functions, but where are they defined? The TON foundation publishes these in the main TON repo in the file [stdlib.fc](https://github.com/ton-blockchain/ton/blob/master/crypto/smartcont/stdlib.fc). Since I've seen multiple versions of this file running around, it's good practice to download it and include it as part of your project.

Download [stdlib.fc](https://raw.githubusercontent.com/ton-blockchain/ton/master/crypto/smartcont/stdlib.fc) and save it in the project directory. 

The func-js compiler supports taking multiple input files as arguments. Note that order matters in this case, so `stdlib.fc` needs to be appear before `counter.fc` which relies on it:

```
npx func-js stdlib.fc counter.fc --boc counter.cell
```

The build should now succeed, with the output of this command being a new file - `counter.cell`. This is a binary file that finally contains the TVM bytecode in cell format that is ready to be deployed on-chain. This will actually be the only file we need for deployment moving forward (we won't need the FunC source file).
