import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { TonClient, Address } from "@ton/ton";
import Counter from "./counter.step9"; // this is the interface class we just implemented
import { retry } from "../../helpers/retry"

export async function run() {
  // initialize ton rpc client on testnet
  const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });
  
  // open Counter instance by address
  const counterAddress = Address.parse(process.env.COUNTER_ADDRESS!.trim());
  const counter = new Counter(counterAddress);
  const counterContract = client.open(counter);

  // call the getter on chain
  await sleep(1500);
  var counterValue:bigint = 0n; 
  await retry(async () => { counterValue = await counterContract.getCounter(); }, {retries: 10, delay: 1000});

  //console.log("value:", counterValue.toString());
  console.log("value:", counterValue >= 1000000000000n ? "more than 1T" : "less than 1T");
}

run()

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}