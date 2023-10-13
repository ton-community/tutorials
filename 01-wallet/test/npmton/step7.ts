import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

async function main() {
  // GH Actions tests use GH secret as mnemonic
  // to run this test locally, you should create the file .env in the project root
  // with your mnemonic phrase (according to repo README)
  // and change step7.expected wallet address to yours
  const mnemonic = process.env.MNEMONIC; 

    // open wallet v4 (notice the correct wallet version here)
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // print wallet address
  console.log(wallet.address.toString({ testOnly: true }));

  // print wallet workchain
  console.log("workchain:", wallet.address.workChain);
}

main();