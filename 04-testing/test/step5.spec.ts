import * as fs from "fs";
import { Cell, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import Counter from "./counter"; // this is the interface class from tutorial 2
import "@ton/test-utils"; // register matchers

describe("Counter tests", () => {
  let blockchain: Blockchain;
  let wallet1: SandboxContract<TreasuryContract>;
  let counterContract: SandboxContract<Counter>;

  beforeEach(async () =>  {
    // prepare Counter's initial code and data cells for deployment
    const counterCode = Cell.fromBoc(fs.readFileSync("counter.debug.cell"))[0]; // version with ~dump instruction
    const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
    const counter = Counter.createForDeploy(counterCode, initialCounterValue);

    // initialize the blockchain sandbox
    blockchain = await Blockchain.create();
    wallet1 = await blockchain.treasury("user1");

    // deploy counter
    counterContract = blockchain.openContract(counter);
    await counterContract.sendDeploy(wallet1.getSender());
  }),

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
});
