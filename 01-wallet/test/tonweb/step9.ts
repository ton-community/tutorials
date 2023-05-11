import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  const mnemonic = process.env.MNEMONIC;
  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
  //const tonweb = new TonWeb(new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", { apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" }));

  // open wallet v4 (notice the correct wallet version here)
  const WalletClass = tonweb.wallet.all["v4R2"];
  const wallet = new WalletClass(tonweb.provider, { publicKey: key.publicKey });

  // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
  const seqno = await wallet.methods.seqno().call() || 0;
  await wallet.methods.transfer({
    secretKey: key.secretKey,
    toAddress: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
    amount: TonWeb.utils.toNano("0.05"), // 0.05 TON
    seqno: seqno,
    payload: "Hello", // optional comment
    sendMode: 3,
  }).send();

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    //console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await wallet.methods.seqno().call() || 0;
  }
  console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}