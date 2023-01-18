import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

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