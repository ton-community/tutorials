import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";

async function main() {
  // Notice:
  // Due to limitations in GitHub Actions, we are unable to use secrets to 
  // store a secure mnemonic for the wallet during the testing of pull 
  // requests from forked repositories by our contributors. 
  // As a result, we are currently using a public wallet with an exposed mnemonic in 
  // our test files when running tests in GH Actions.
  // const mnemonic = process.env.MNEMONIC;
  const mnemonic =
    'table jungle security cargo adjust barrel dance net permit pig soap simple rabbit upgrade unique update firm between deer minor ship thought ride physical';
    
  const key = await mnemonicToKeyPair(mnemonic!.split(" "));

  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
  //const tonweb = new TonWeb(new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", { apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" }));

  // open wallet v4 (notice the correct wallet version here)
  const WalletClass = tonweb.wallet.all["v4R2"];
  const wallet = new WalletClass(tonweb.provider, { publicKey: key.publicKey });
  const walletAddress = await wallet.getAddress();

  // query balance from chain
  const balance = await tonweb.getBalance(walletAddress);
  //console.log("balance:", TonWeb.utils.fromNano(balance));
  console.log("balance:", parseFloat(TonWeb.utils.fromNano(balance)) >= 1 ? "more than 1" : "less than 1");

  // query seqno from chain
  const seqno = await wallet.methods.seqno().call();
  //console.log("seqno:", seqno);
  console.log("seqno:", seqno ?? 0 >= 1 ? "more than 1" : "less than 1");
}

main();