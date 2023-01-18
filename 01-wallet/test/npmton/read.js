import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

// step 7

import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV4 } from "ton";

const mnemonic = process.env.MNEMONIC;
const key = await mnemonicToWalletKey(mnemonic.split(" "));

const wallet = WalletContractV4.create({
  publicKey: key.publicKey,
  workchain: 0
});

console.log(wallet.address.toString());

// step 8

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, fromNano } from "ton";

const endpoint = await getHttpEndpoint({
  network: "testnet"
});
//const client = new TonClient({ endpoint });
const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });

const balance = await client.getBalance(wallet.address);
console.log("balance:", fromNano(balance) >= 1 ? "more than 1" : "less than 1");

const walletContract = client.open(wallet);
const seqno = await walletContract.getSeqno();
console.log("seqno:", seqno >= 1 ? "more than 1" : "less than 1");