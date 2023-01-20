import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, internal } from "ton";

async function step9() {
  const mnemonic = process.env.MNEMONIC;
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));

  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0
  });

  const endpoint = await getHttpEndpoint({
    network: "testnet"
  });
  //const client = new TonClient({ endpoint });
  const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });

  // send 0.001 TON to EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI
  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno: seqno,
    messages: [
      internal({
        to: "EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI",
        value: "0.001", // 0.001 TON
        body: "Hello", // optional comment
        bounce: false,
      })
    ]
  });

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    //console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

step9();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}