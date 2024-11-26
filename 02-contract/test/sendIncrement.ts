import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, Address } from "@ton/ton";
import Counter from "./counter.step10"; // this is the interface class we just implemented

export async function run() {
  // initialize ton rpc client on testnet
  const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });

  // open wallet v4 (notice the correct wallet version here)
  const mnemonic =
  'table jungle security cargo adjust barrel dance net permit pig soap simple rabbit upgrade unique update firm between deer minor ship thought ride physical';
  const key = await mnemonicToWalletKey(mnemonic!.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // open Counter instance by address
  const counterAddress = Address.parse(process.env.COUNTER_ADDRESS!.trim());
  const counter = new Counter(counterAddress);
  const counterContract = client.open(counter);

  // send the increment transaction
  await counterContract.sendIncrement(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    //console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

run()

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
