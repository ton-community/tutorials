
# TON Hello World part 3: Step by step guide for building your first web client

In the previous tutorial we deployed a Counter smart contract to TON blockchain (either testnet or mainnet). This contract acts as the *backend server* of our application. In this tutorial, we will implement the *frontend* or *client* and allow end-users to access it from a web browser.

We will also recall that the appilcation that we're building is *decentralized*. Decentralized apps (dapps) have special [properties](https://defi.org/ton/#app-safety-guidelines). For example, their frontend must only run client-side. This means that we're not supposed to rely on a backend server for serving our frontend. If we had such a server, by definition it would be centralized (our end-users will not have equal access to it), and thus make our entire app centralized as well.

## Usage patterns

TON blockchain is inspired and complementary to [Telegram](https://telegram.org/) messenger. It aims for mass adoption by the next billion users. Since Telegram messenger is a mobile-first app, it makes sense that we design our dapp to be mobile-first as well.

The first usage patten of our dapp would be through a regular web browser. Our frontend would be hosted on some domain using a service like [GitHub Pages](https://pages.github.com/). End-users would input the dapp URL in their favorite web browser and access our dapp using HTML and JavaScript. This is quite standard.

The second usage pattern is a bit more special. Since TON blockchain complements the Telegram messenger, we will also want to embed our dapp right into the Telegram app itself. Telegram provides special API for building [Telegam Web Apps](https://core.telegram.org/bots/webapps) (TWAs). These tiny apps closely resemble websites and also rely on HTML and JavaScript. They normally run within the context of a Telegram bot and provide a sleek user experience without ever leaving the host Telegram app.

<video src="https://core.telegram.org/file/464001679/11aa9/KQx_BlPVXRo.4922145.mp4/c65433c8ac11a347a8" loop muted autoplay width=400 preload="auto"></video>

During the course of this tutorial we will create a single codebase that will accomodate both usage patterns.

## Step 2: Set up your local machine

Before we can start writing code, we need to install certain developer tools on our computer.

Since our frontend will run inside a browser, it will be implemented in JavaScript. The most convenient runtime for developing JavaScript projects is Nodejs. The installation instructions are [here](https://nodejs.org/). We will need a fairly recent version of node like v16 or v17. You can verify your nodejs version by running `node -v` in terminal.

The second tool we need is an initialized TON wallet like [TonKeeper](https://tonkeeper.com). If you don't have a wallet, please take a look at tutorial 1. The wallet will communicate with our dapp via a protocol called [TON Connect 2](https://github.com/ton-connect). If you choose a different wallet than TonKeeper, please verify it supports this version of TON Connect. Don't forget to make sure your wallet is connected to the correct network - mainnet or testnet.

## Step 3: Set up the project

We will build our frontend with [React](https://reactjs.org/). To create our project we will rely on [Vite](https://vitejs.dev/) and its React template. Choose a name for your project, for example `my-twa`, then open terminal and run the following:

```console
npm create vite@latest my-twa -- --template react-ts
cd my-twa
npm install
```

We will need to install a few more packages that will allow us to interact with TON blockchain. We've seen these packages in action in the previous tutorial. Run the following in terminal:

```console
npm install ton ton-core
npm install @orbs-network/ton-access
```

Last but not least, we will need to overcome [ton](https://www.npmjs.com/package/ton) library's reliance on Nodejs `Buffer` that isn't available in the browser. We can do that by installing a polyfill. Run the following in terminal:

```console
npm install vite-plugin-node-polyfills
```

Now modify the file `vite.config.ts` so it looks like this:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
});
```

To see your empty app template, run in terminal:

```console
npm run dev
```

Then open a web browser and direct it the URL shown on-screen (like `http://localhost:5173/`).

## Step 4: Set up TON Connect

[TON Connect](https://github.com/ton-connect) is the protocol by which our app will communicate with the end-user's wallet. The TON Connect React library will provide us with some useful services like showing the end-user a list of TON Connect 2 supported wallets, querying the user's wallet for its public address and sending a transaction through the wallet.

Install the library by running in terminal:

```console
npm install @tonconnect/ui-react
```

When our app connects to the user's wallet, it will identify itself using a [manifest](https://github.com/ton-connect/sdk/tree/main/packages/sdk#add-the-tonconnect-manifest) file. The wallet will ask for the user's permission to connect to the app and display the information from the manifest. Since the manifest needs to be publicly available on the Internet, we're going to use an example one that I've deployed in advance during development. Later, when we deploy our website, we will replace the example manifest with your real one.

Modify the file `src/main.tsx` to use the TON Connect provider:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// this manifest is used temporarily for development purposes
const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>,
)
```

## Step 5: Add a Connect button to the app

The first action we're going to offer the user is to *Connect* their wallet to the app. By connecting, the user agrees to share their public wallet address with the app. This isn't very dangerous since the entire transaction history of the wallet and its balance are publicly available on-chain anyways.

Edit the file `src/App.tsx` and replace its contents with the following:

```tsx
import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';

function App() {
  return (
    <div>
      <TonConnectButton />
    </div>
  );
}

export default App
```

The only thing our new app UI will have is the Connect button. To run the app, run in terminal:

```console
npm run dev
```

Then refresh the web browser viewing the URL shown on-screen. I'm assuming you're using the web browser on your desktop (where you're developing) and your TonKeeper wallet is installed on your mobile device. Click "Connect Wallet" on the desktop and choose "Tonkeeper" (or any other supporting wallet you're using).

TON Connect supports both mobile-mobile user flows and desktop-mobile user flows. Since development is a desktop-mobile flow, TON Connect will rely on scanning QR codes in order to communicate with the wallet running on your mobile device. Open the TonKeeper mobile app, tap the QR button on the top right and scan the code from your desktop screen.

If everything is wired properly, you should see a confirmation dialong in the wallet mobile app. If you approve the connection, you will see your address in the web app UI!

## Step 6: Read the counter value from the chain

It's time to interact with our Counter contract and show the current counter value. To do that, we will need the TypeScript interface class that we created in tutorial 2. This class is useful because it defines all possible interactions with the contract in a manner that abstracts implementation and encoding details. This is particularly useful when you have one developer in your team that writes the contract and a different developer that builds the frontend.

Copy `counter.ts` from tutorial 2 to `src/contracts/counter.ts` (also available [here](https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/contracts/counter.ts)).

The next thing we'll do is implement a general purpose React [hook](https://reactjs.org/docs/hooks-intro.html) that will assist us in initializing async objects. Create the file `src/hooks/useAsyncInitialize.ts` with the following content:

```ts
import { useEffect, useState } from 'react';

export function useAsyncInitialize<T>(func: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<T | undefined>();
  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}
```

Next, we're going to create another React hook that will rely on `useAsyncInitialize` and will initialize an RPC client in our app. An RPC service provider similar to [Infura](https://infura.io) on Ethereum will allow us to query data from the chain. These providers run TON blockchain nodes and allow us to communicate with them over HTTP. [TON Access](https://orbs.com/ton-access) is an awesome service that will provide us with unthrottled API access for free. It's also decentralized, which is the preferred way to access the network.

Create the file `src/hooks/useTonClient.ts` with the following content:

---
network:testnet
---
```ts
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';
import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: 'testnet' }),
      })
  );
}
```

---

---
network:mainnet
---
```ts
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';
import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint(),
      })
  );
}
```

---