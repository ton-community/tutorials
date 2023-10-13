import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  // use your mnemonic phrase from .end file in the root of the project and change wallet address
  // const mnemonic = process.env.MNEMONIC;
  // also you need to change your wallet address in step7.expected.txt to run test
  const mnemonic = "memory album during buyer copper until arm forest identify race eyebrow bunker dawn phrase butter knock owner thumb click lottery catalog desk trial copper"; // your 24 secret words (replace ... with the rest of the words)
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