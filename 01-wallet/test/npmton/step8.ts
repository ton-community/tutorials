import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV4, TonClient, fromNano } from "ton";

async function step8() {
  const mnemonic = process.env.MNEMONIC;; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));

  const wallet = WalletContractV4.create({ // notice the correct wallet version here
    publicKey: key.publicKey,
    workchain: 0
  });

  const endpoint = await getHttpEndpoint({
    network: "testnet"
  });
  const client = new TonClient({ endpoint });
  //const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });

  const balance = await client.getBalance(wallet.address);
  //console.log("balance:", fromNano(balance));
  console.log("balance:", parseFloat(fromNano(balance)) >= 1 ? "more than 1" : "less than 1");

  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  //console.log("seqno:", seqno);
  console.log("seqno:", seqno >= 1 ? "more than 1" : "less than 1");
}

step8();