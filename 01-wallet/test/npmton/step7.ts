import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

async function main() {
  // Notice:
  // Due to limitations in GitHub Actions, we are unable to use secrets to 
  // store a secure mnemonic for the wallet during the testing of pull 
  // requests from forked repositories by our contributors. 
  // As a result, we are currently using a public wallet with an exposed mnemonic in 
  // our test files when running tests in GH Actions.
  // const mnemonic = process.env.MNEMONIC ;
  const mnemonic =
    'table jungle security cargo adjust barrel dance net permit pig soap simple rabbit upgrade unique update firm between deer minor ship thought ride physical';


    // open wallet v4 (notice the correct wallet version here)
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // print wallet address
  console.log(wallet.address.toString({ testOnly: true }));

  // print wallet workchain
  console.log("workchain:", wallet.address.workChain);
}

main();