import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  const mnemonic = process.env.MNEMONIC; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  // open wallet v4 (notice the correct wallet version here)
  const tonweb = new TonWeb();
  const WalletClass = tonweb.wallet.all["v4R2"];
  const wallet = new WalletClass(undefined!, { publicKey: key.publicKey });

  // print wallet address
  const walletAddress = await wallet.getAddress();
  console.log(walletAddress.toString(true, true, true));

  // print wallet workchain
  console.log("workchain:", walletAddress.wc);
}

main();