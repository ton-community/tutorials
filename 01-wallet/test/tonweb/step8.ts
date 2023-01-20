import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function step8() {
  const mnemonic = process.env.MNEMONIC; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  const endpoint = await getHttpEndpoint({
    network: "testnet"
  });
  //const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
  const tonweb = new TonWeb(new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", { apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" }));

  const WalletClass = tonweb.wallet.all["v4R2"]; // notice the correct wallet version here
  const wallet = new WalletClass(tonweb.provider, { 
    publicKey: key.publicKey 
  });
  const walletAddress = await wallet.getAddress();

  const balance = await tonweb.getBalance(walletAddress);
  //console.log("balance:", TonWeb.utils.fromNano(balance));
  console.log("balance:", parseFloat(TonWeb.utils.fromNano(balance)) >= 1 ? "more than 1" : "less than 1");

  const seqno = await wallet.methods.seqno().call();
  //console.log("seqno:", seqno);
  console.log("seqno:", seqno ?? 0 >= 1 ? "more than 1" : "less than 1");
}

step8();