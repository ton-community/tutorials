import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function step7() {
  const mnemonic = process.env.MNEMONIC; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  const tonweb = new TonWeb();
  const WalletClass = tonweb.wallet.all["v4R2"]; // notice the correct wallet version here
  const wallet = new WalletClass(undefined!, {
    publicKey: key.publicKey
  });

  const walletAddress = await wallet.getAddress();
  console.log(walletAddress.toString(true, true, true));
}

step7();