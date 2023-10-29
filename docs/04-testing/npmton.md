
# TON Hello World part 4: Step-by-step guide for testing your first smart contract

Testing is a big part of smart contract development. Smart contracts often deal with money, and we don't want any of our users to lose money because the smart contract had a bug. This is why it's normally expected from smart contract developers to share an automated test suite next to their FunC implementation. Every user who wants to be convinced that the contract is working as expected is welcome to execute the test suite and see for themselves.

A thorough test suite is also a good signal to your users that you've taken your role as a contract developer seriously. I would personally be very hesitant to deposit a substantial amount of money in any contract that has no tests. Since *code is law*, any bug in the contract code is also part of the agreement, so a user wouldn't really have anyone to blame for money lost but themselves.

Personally, I don't view testing as an afterthought taking place only when your code is complete. If done correctly, tests can be a powerful aid to the development process itself from the beginning, which will allow you to write better code faster.

## Oh, so many ways to test

*Warning - This specific section is a bit more advanced than beginner. Feel free to skip directly to step 1 if you trust my judgment on how to test. If you're interested in an overly detailed overview of what other testing methodologies exist in our ecosystem, please read on.*

Because testing is such as big deal in smart contract development, there's a surprising amount of tools and infrastructure in the TON ecosystem devoted to this topic. Before jumping in to the methodology that I believe in, I want to give a quick overview of the plethora of testing tools that are available out there:

1. **Deploying your contract to testnet** - Testnet is a live alternative instance of the entire TON Blockchain where TON coin isn't the real deal and is free to get. This instance is obviously not as secure as mainnet, but offers an interesting staging environment where you can play.

2. **Local blockchain with MyLocalTon** - [MyLocalTon](https://github.com/neodiX42/MyLocalTon) is a Java-based desktop executable that runs a personal local instance of TON Blockchain on your machine that you can deploy contracts to and interact with. Another way to run a local private TON network is using Kubernetes with [ton-k8s](https://github.com/disintar/ton-k8s).

3. **Writing tests in FunC** - [toncli](https://github.com/disintar/toncli) is a command-line tool written in Python that runs on your machine and supports [debug](https://github.com/disintar/toncli/blob/master/docs/advanced/transaction_debug.md) and [unit tests](https://github.com/disintar/toncli/blob/master/docs/advanced/func_tests_new.md) for FunC contracts where the tests are also written in FunC ([example](https://github.com/BorysMinaiev/func-contest-1-tests-playground/blob/main/task-1/tests/test.fc)).

4. **Bare-bones TVM with Sandbox** - [Sandbox](https://github.com/ton-org/sandbox) is a bare-bones version of just the [TVM](https://ton-blockchain.github.io/docs/tvm.pdf) running on [WebAssembly](https://webassembly.org/) with a thin JavaScript wrapper that allows test interactions from TypeScript.

5. **Deploying beta contracts to mainnet** - This form of "testing in production" simply deploys alternative beta versions of your contracts to mainnet and uses real (not free) TON coin to play with them in a real environment. If you found a bug, you simply deploy new fixed beta versions and waste a little more money.

So which method should you choose? You definitely don't need all of them.

My team started building smart contracts on Ethereum in 2017, we've witnessed the evolution of the art of smart contract development almost from its infancy. While I'm well aware of [fundamental differences](https://blog.ton.org/six-unique-aspects-of-ton-blockchain-that-will-surprise-solidity-developers) between TON and the EVM, testing between the two platforms is not fundamentally different. All of the above approaches appeared on Ethereum at one point or another. And all of them practically disappeared - except two - the last two.

1. Testnets were once popular on Ethereum (funny names like Ropsten, Rinkeby and Goerli) but turned out to be a bad tradeoff between convenience and realism - they're slow and often more difficult to work with than mainnet (some wallets aren't compatible) and useless for integration tests with other contracts (e.g. your contract interacts with somebody else's token) because nobody bothers to maintain up-to-date versions of their projects on testnet.

2. Local desktop versions of the entire blockchain, like [Ganache UI](https://trufflesuite.com/ganache/), proved to be too slow for unit tests and ineffective for integration tests (for the same reason as testnets). They also don't play nicely with [CI](https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration). People often confuse [ganache-cli](https://github.com/trufflesuite/ganache) with a local blockchain, but it is actually a bare-bones EVM implemented in JavaScript.

3. Testing Solidity with Solidity proved to be too cumbersome as smart contract languages are inherently limited and restrictive by design and efficient testing seems to flourish on freeform languages like JavaScript. Trying to code a complex expectation in Solidity or simulate a difficult scenario is just too painful.

4. Bare-bones EVM turned out to be the holy grail. Most of the testing on Ethereum today takes place on [Hardhat](https://hardhat.org/) and Hardhat is a thin wrapper around [EthereumJs](https://github.com/ethereumjs/ethereumjs-monorepo) which is an EVM implementation in JavaScript. This approach turned out to be the most convenient (ultra-fast CI-friendly unit tests) as well as realistic where it matters (live lazy-loaded [forks](https://hardhat.org/hardhat-network/docs/guides/forking-other-networks) of mainnets for integration tests).

5. Testing in production is useful for the last mile. Ethereum has less than [5 million](https://www.fool.com/the-ascent/cryptocurrency/articles/more-people-own-ethereum-than-ever-before-heres-why/) active users yet over [40 million](https://cryptopotato.com/over-44-million-contracts-deployed-to-ethereum-since-genesis-research/) deployed contracts. The vast majority of all deployed contracts on Ethereum mainnet are beta versions that developers deployed for a few tests and then abandoned. Don't feel bad about polluting mainnet with garbage, nobody cares.

After carefully considering all available approaches, I hope I convinced you why we're going to spend 90% of our time testing with approach (4) and 10% of our time testing with approach (5). We're going to conveniently forget about the other approaches and avoid using them at all.

## Step 1: Set up the project

Since we're using TypeScript for tests, make sure [Node.js](https://nodejs.org/) is installed by running `node -v` in terminal and the version is at least v18. If you have an old version, you can upgrade with [nvm](https://github.com/nvm-sh/nvm).

Let's create a new directory for our project. Open terminal in the project directory and run the following:

```console
npm install typescript jest @types/jest ts-jest
```

This will install TypeScript and the popular [jest](https://jestjs.io/) test runner. To configure TypeScript to run correctly, we need to create the file `tsconfig.json` and put it in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

And to configure jest to run correctly, we need to create the file `jest.config.js` and put it in the project root:

```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
};
```

And finally, run in terminal:

```console
npm install @ton/core @ton/sandbox @ton/test-utils
```

This will install [Sandbox](https://github.com/ton-org/sandbox) and its dependencies. Sandbox is our magical library that will emulate TON Blockchain locally by running a bare-bones version of the TVM in process. This will guarantee that our tests will be blazingly fast and completely isolated.

## Step 2: Load our contract in a test

Quick reminder, in tutorial 2, we compiled our Counter smart contract in step 6 and generated the file `counter.cell` which contains the TVM bytecode for our contract (code cell). In step 7, before deploying the contract, we initialized its persistent storage (data cell). Then, we created the TypeScript interface class `counter.ts` that combines the two to deploy our contract.

Dig into your completed tutorial 2 and copy both `counter.cell` (also available [here](https://raw.githubusercontent.com/ton-community/tutorials/main/04-testing/test/counter.cell)) and `counter.ts` (also available [here](https://raw.githubusercontent.com/ton-community/tutorials/main/04-testing/test/counter.ts)) to the project root.

We're going to deploy the Counter contract in our test using the interface class in an almost identical way to how we deployed it to the actual chain in tutorial 2:

```ts
// prepare Counter's initial code and data cells for deployment
const counterCode = Cell.fromBoc(fs.readFileSync("counter.cell"))[0]; // compilation output from tutorial 2
const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
const counter = Counter.createForDeploy(counterCode, initialCounterValue);
```

Notice that this time we can initialize the counter value to a simple number like 17 because we're no longer afraid of collisions. All users of this tutorial can end up with the same contract address and that's ok since Sandbox creates an isolated private blockchain.

Before we start writing tests, let's create our test skeleton. In the skeleton, before each test starts, we'll initialize a fresh instance of the entire blockchain. This instance will require a wallet with enough TON for all our gas needs (we call this a "treasury") and a deployed version of the Counter.

Create the file `step2.spec.ts` with the following content:

```ts
import * as fs from "fs";
import { Cell } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import Counter from "./counter"; // this is the interface class from tutorial 2

describe("Counter tests", () => {
  let blockchain: Blockchain;
  let wallet1: SandboxContract<TreasuryContract>;
  let counterContract: SandboxContract<Counter>;
  
  beforeEach(async () =>  {
    // prepare Counter's initial code and data cells for deployment
    const counterCode = Cell.fromBoc(fs.readFileSync("counter.cell"))[0]; // compilation output from tutorial 2
    const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
    const counter = Counter.createForDeploy(counterCode, initialCounterValue);

    // initialize the blockchain sandbox
    blockchain = await Blockchain.create();
    wallet1 = await blockchain.treasury("user1");

    // deploy counter
    counterContract = blockchain.openContract(counter);
    await counterContract.sendDeploy(wallet1.getSender());
  }),

  it("should run the first test", async () => {
    // currently empty, will place a test body here soon
  });
});
```

This code is remarkably similar to the deployment code we had in tutorial 2. This is the benefit of using the TypeScript interface class. No matter where we use our contract, we always access it in the same familiar way.

The only strange part in this snippet is the treasury. What is it exactly? A treasury is simply a wallet contract, very similar to the v4 wallet you used with [Tonkeeper](https://tonkeeper.com) in previous tutorials. What's useful with a treasury is that it's already pre initialized with a big TON coin balance. There's no need to fund it from a faucet.

To execute the test, run in terminal:

```console
npx jest step2
```

Our test is empty, so it should naturally pass. Notice that if we had 3 different tests (3 different `it()` clauses), the blockchain would be initialized from scratch 3 times and the Counter would be deployed 3 times. This is excellent because different tests are completely isolated from each other. If one test fails, it will not influence the others.

## Step 3: Test a getter

Now that the boilerplate is behind us, we can finally focus on writing the actual test logic. Ideally, we want to test through every execution path of our contract to make sure it's working. Let's start with something simple, our getter. Quick reminder, in tutorial 2 we implemented a getter in FunC that looked like this:

```func
int counter() method_id {        ;; getter declaration - returns int as result
  var (counter) = load_data();   ;; call our read utility function to load value
  return counter;
}
```

As you recall, our test skeleton initializes our contract with a data cell via `Counter.createForDeploy()`. If the initial counter value is 17, we expect the getter to return 17 after initialization.

Copy the skeleton to a new file named `step3.spec.ts` and add the following test to it:

```ts
  it("should get counter value", async () => {
    const value = await counterContract.getCounter();
    expect(value).toEqual(17n);
  });
```

The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/04-testing/test/step3.spec.ts).

There's something interesting to notice in the assertion at the end of the test - the `expect()`. When we compare the counter value we don't compare it to the number `17`, but to `17n`. What is this notation? The `n` signifies that the number is a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). The FunC type returned from our getter is `int`. This TVM number type is [257 bit long](https://ton.org/docs/develop/func/types?id=atomic-types) (256 signed) so it supports huge virtually unbounded numbers. The native JavaScript `number` type is limited to [64 bit](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), so it cannot necessarily hold the result. We use JavaScript big numbers to work around this limitation.

To execute the test, run in terminal:

```console
npx jest step3
```

The test should pass. Try to change the expectation to verify that the returning value is `18n` and see how the test fails.

## Step 4: Test a message

While getters are read-only operations that don't change contract state, messages are used to modify state through user transactions. Reminder, we've implemented the following message handler in tutorial 2:

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

Let's write a test that sends a message with op #1 = *increment*. Our interface class already knows how to encode the message.

Copy the last test file to a new file named `step4.spec.ts` and add the following test to it:

```ts
  it("should increment the counter value", async () =>  {
    await counterContract.sendIncrement(wallet1.getSender());
    const counterValue = await counterContract.getCounter();
    expect(counterValue).toEqual(18n);
  })
```

The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/04-testing/test/step4.spec.ts).

Notice that we already know from the previous test that the counter is indeed initialized to 17, so if our message was successful, we can use the getter to get the counter value and make sure it has been incremented to 18.

To execute the test, run in terminal:

```console
npx jest step4
```

Like before, the test should pass.

## Step 5: Debug by dumping variables

Testing is fun as long as everything works as expected. But what happens when something doesn't work, and you're not sure where the problem is? The most convenient method I found to debug your FunC code is to add debug prints in strategic places. This is very similar to debugging JavaScript by using `console.log(variable)` to [print](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) the value of variables.

The TVM has a special instruction for [dumping variables](https://ton.org/docs/develop/func/builtins?id=dump-variable) in debug. Run `~dump(variable_name);` in your FunC code to use it. You can also print constants by using `~dump(12345);` which can be helpful to show that the VM indeed reached a certain line.

Another useful TVM instruction can dump strings in debug. Run `~strdump(string_value);` in your FunC code to use it.

Let's try both. Let's say we're trying to send some TON coin to our contract on a message. We can do this by issuing a simple transfer from our wallet to our contract address. In FunC, this value should arrive under the `msg_value` argument of `recv_internal()`. Let's print this incoming value in FunC to make sure that it indeed works as expected. I added the debug print as the first line of our `recv_internal()` message handler from before:

```func
() recv_internal(int msg_value, cell in_msg, slice in_msg_body) impure {
  ~dump(msg_value);                         ;; first debug print
  if (in_msg_body.slice_empty?()) { 
    return (); 
  }
  int op = in_msg_body~load_uint(32);
  var (counter) = load_data();
  if (op == 1) {
    ~strdump("increment received");         ;; second debug print
    save_data(counter + 1);
  }
}
```

The second debug print I added is whenever an op #1 = *increment* message received. This time I print a constant string instead of a variable.

Since we changed our FunC code, we'll have to rebuild the contract to see the effect and generate a new `counter.cell`. I've done this for your convenience and renamed the file to `counter.debug.cell`, it is available [here](https://raw.githubusercontent.com/ton-community/tutorials/main/04-testing/test/counter.debug.cell).

Copy the original test skeleton to a new file named `step5.spec.ts` and add the following tests:

```ts
  it("should send ton coin to the contract", async () => {
    console.log("sending 7.123 TON");
    await wallet1.send({
      to: counterContract.address,
      value: toNano("7.123")
    });
  });

  it("should increment the counter value", async () =>  {
    console.log("sending increment message");
    await counterContract.sendIncrement(wallet1.getSender());
  })
```

The resulting source file should look like [this](https://github.com/ton-community/tutorials/blob/main/04-testing/test/step5.spec.ts).

Run the test and take a close look at the console output in terminal:

```console
npx jest step5
```

The console output should include something like this:

```console
  console.log
    sending 7.123 TON

  console.log
    #DEBUG#: s0 = 7123000000

  console.log
    sending increment message

  console.log
    #DEBUG#: s0 = 2000000

  console.log
    #DEBUG#: increment received
```

We can see that the debug messages are printed when the test is running. When we send some TON coin explicitly to the contract (7.123 coins), we can see that the first debug print indeed shows the expected value of `msg_value`. Since the TVM doesn't support floating points, the number is represented internally as a large integer (with 9 decimals, meaning multiplied by 10^9). On the second test, when we send the increment op, we can see both debug prints showing. This is because this message also includes a small amount of coins for gas.

If you would like to see even more verbose log output from running your contracts, you can [increase the verbosity](https://github.com/ton-org/sandbox#viewing-logs) of the `blockchain` object after creating it in beforeEach:

```ts
blockchain.verbosity = {
  print: true,
  blockchainLogs: true,
  vmLogs: "vm_logs_full",
  debugLogs: true,
}
```

## Step 6: Test in production (without testnet)

Steps 2-5 above are all part of approach (4) - where I promised to spend 90% of our testing time. These tests are very fast to run (there's nothing faster than an in-process instance of a bare-bones TVM) and are very CI-friendly. They are also free and don't require you to spend any TON coin. These tests should give you the majority of confidence that your code is actually working.

What about the remaining 10%? All of our tests so far worked inside a lab. Before we're launching our contract, we should run some tests in the wild! This is what approach (5) is all about.

From a technical perspective, this is actually the simplest approach of all. You don't need to do anything special. Get some TON coin and deploy your contract to mainnet! The process was covered in detail in tutorial 2. Then, interact with your contract manually just like your users will. This will normally depend on the dapp client we wrote in tutorial 3.

If this step is so easy, why am I devoting so much time to discuss it? Because, from my experience, most dapp developers are reluctant to do so. Instead of testing on mainnet, they prefer to work on testnet. In my eyes, this is a waste of time. Let me attempt to refute any reasons to use testnet one last time:

* *"testnet is as easy to work with as mainnet"* - False. Testnet is less reliable and isn't held to the same production standard as mainnet. It also requires special wallets and special explorers. This mess is going to cost you time to sort out. I've seen too many developers deploying their contract to testnet and then trying to inspect it with a mainnet explorer without understanding why they don't see anything deployed.

* *"mainnet is more expensive since it costs real TON coin to use"* - False. Deploying your contract to mainnet costs around 10 cents. Your time costs more. Let's say an hour of your time is only worth the minimum wage in the US (a little over $7), if working on mainnet saves you an hour, you can deploy your contract 70 times without feeling guilty that you're wasting money.

* *"testnet is a good simulation of mainnet"* - False. Nobody cares deeply about testnet since it's not a production network. Are you certain that validators on testnet are running the latest node versions? Are all config parameters like gas costs identical to mainnet? Are all contracts by other teams that you may be relying on deployed to testnet?

* *"I don't want to pollute mainnet with abandoned test contracts"* - Don't worry about it. Users won't care since the chance of them reaching your unadvertised contract address by accident is zero. Validators won't care since you paid them for this service, they enjoy the traction. Also, TON has an auto-cleanup mechanism baked in, your contract will eventually run out of gas for rent and will be destroyed automatically.

## Reward

Congratulations on successfully completing this tutorial! Before we conclude, let's take a quick look at the exciting reward awaiting you from the <a target="_blank" href="https://getgems.io/collection/EQDMLnAidBQHajOXI-wKKdyy6NjP8pgBAIGiVmSRZ9mJF1iM">"TON Masters"</a> collection:
<video style="border-radius: 10pt; margin: 25pt auto; display: block;" width="40%" autoplay loop muted playsinline>
  <source src="https://ton-devrel.s3.eu-central-1.amazonaws.com/tal-tutorials/4-testing/video.mp4" type="video/mp4">
</video>

Ready to claim your reward? Simply scan the QR code below or click <a href="ton://transfer/EQCZ52LU4PsK71IVjn4Ur599R4ZdsnT9ToAEqysot628BEdo?bin=te6cckEBAQEABgAACAAPmEfY662P&amount=50000000">here</a>:
  <img src="https://i.imgur.com/tewJ6Wg.png" width=300 alt="QR-code" style="display: block; margin-left: auto; margin-right: auto; width: 50%;"/>

## Conclusion

For your convenience, all the code in this tutorial is available in executable form [here](https://github.com/ton-community/tutorials/blob/main/04-testing/test).

In this tutorial we created our project skeleton manually, mostly so we can understand what happens under the hood. When creating a new contract project, you can have an excellent skeleton created automatically by an awesome dev tool called [Blueprint](https://github.com/ton-org/blueprint). To create a new contract project with Blueprint, run in terminal and follow the on-screen instructions:

```console
npm create ton@latest
```

If you found a mistake in this tutorial, please [submit a PR](https://github.com/ton-community/tutorials/pulls) and help us fix it. This tutorial platform is fully open source and available at [https://github.com/ton-community/tutorials](https://github.com/ton-community/tutorials).

Happy coding!
