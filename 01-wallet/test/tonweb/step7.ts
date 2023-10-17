import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  // Notice:
  // Due to limitations in GitHub Actions, we are unable to use secrets to 
  // store a secure mnemonic for the wallet during the testing of pull 
  // requests from forked repositories by our contributors. 
  // As a result, we are currently using a public wallet with an exposed mnemonic in 
  // our test files when running tests in GH Actions.
  // const mnemonic = process.env.MNEMONIC;
  const mnemonic =
    'table jungle security cargo adjust barrel dance net permit pig soap simple rabbit upgrade unique update firm between deer minor ship thought ride physical';

  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  // open wallet v4 (notice the correct wallet version here)
  const tonweb = new TonWeb();
  const WalletClass = tonweb.wallet.all["v4R2"];
  const wallet = new WalletClass(undefined!, { publicKey: key.publicKey });

  // print wallet address
  const walletAddress = await wallet.getAddress();
  console.log(walletAddress.toString(true, true, true, true)); // last true required for testnet

  // print wallet workchain
  console.log("workchain:", walletAddress.wc);
}

main();