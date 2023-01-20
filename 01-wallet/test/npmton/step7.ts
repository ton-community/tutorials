import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV4 } from "ton";

async function step7() {
  const mnemonic = process.env.MNEMONIC;; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));

  const wallet = WalletContractV4.create({ // notice the correct wallet version here
    publicKey: key.publicKey,
    workchain: 0
  });

  console.log(wallet.address.toString());
}

step7();