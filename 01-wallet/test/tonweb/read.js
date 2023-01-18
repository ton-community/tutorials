import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

// step 7

import tonMnemonic from "tonweb-mnemonic";
import TonWeb from "tonweb";

const mnemonic = process.env.MNEMONIC;
const key = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));

const tonweb = new TonWeb();
const WalletClass = tonweb.wallet.all["v4R2"];
const wallet = new WalletClass(undefined, {
  publicKey: key.publicKey
});

const walletAddress = await wallet.getAddress();
console.log(walletAddress.toString(true, true, true));

// step 8

import { getHttpEndpoint } from "@orbs-network/ton-access";

const endpoint = await getHttpEndpoint({
  network: "testnet"
});
//const tonweb2 = new TonWeb(new TonWeb.HttpProvider(endpoint));
const tonweb2 = new TonWeb(new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", { apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" }));

const WalletClass2 = tonweb2.wallet.all["v4R2"];
const wallet2 = new WalletClass2(tonweb2.provider, { 
  publicKey: key.publicKey 
});

const balance = await tonweb2.getBalance(walletAddress);
console.log("balance:", TonWeb.utils.fromNano(balance) >= 1 ? "more than 1" : "less than 1");

const seqno = await wallet2.methods.seqno().call();
console.log("seqno:", seqno >= 1 ? "more than 1" : "less than 1");