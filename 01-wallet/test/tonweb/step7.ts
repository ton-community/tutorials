import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  // GH Actions tests use GH secret as mnemonic
  // to run this test locally, you should create the file .env in the project root
  // with your mnemonic phrase (according to repo README)
  // and change step7.expected wallet address to yours
  const mnemonic = process.env.MNEMONIC; 
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