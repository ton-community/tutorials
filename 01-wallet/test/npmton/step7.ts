import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

async function main() {
  // use your mnemonic phrase from .end file in the root of the project and change wallet address
  // const mnemonic = process.env.MNEMONIC;
  // also you need to change your wallet address in step7.expected.txt to run test
  const mnemonic = "memory album during buyer copper until arm forest identify race eyebrow bunker dawn phrase butter knock owner thumb click lottery catalog desk trial copper"; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // print wallet address
  console.log(wallet.address.toString({ testOnly: true }));

  // print wallet workchain
  console.log("workchain:", wallet.address.workChain);
}

main();