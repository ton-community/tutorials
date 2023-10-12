
# TON Hello World part 3: Step by step guide for building your first web client

In the previous tutorial we deployed a Counter smart contract to TON Blockchain (either testnet or mainnet). This contract acts as the *backend server* of our application. In this tutorial, we will implement the *frontend* or *client* and allow end-users to access it from a web browser.

We will also recall that the appilcation that we're building is *decentralized*. Decentralized apps (dapps) have special [properties](https://defi.org/ton/#app-safety-guidelines). For example, their frontend must only run client-side. This means that we're not supposed to rely on a backend server for serving our frontend. If we had such a server, by definition it would be centralized (our end-users will not have equal access to it), and thus make our entire app centralized as well.

## Usage patterns

TON Blockchain is inspired by and complementary to [Telegram](https://telegram.org/) messenger. It aims for mass adoption by the next billion users. Since Telegram messenger is a mobile-first app, it makes sense that we design our dapp to be mobile-first as well.

The first usage patten of our dapp would be through a regular web browser. Our frontend would be hosted on some domain using a service like [GitHub Pages](https://pages.github.com/). End-users would input the dapp URL in their favorite web browser and access our dapp using HTML and JavaScript. This is quite standard.

The second usage pattern is a bit more special. Since TON Blockchain complements the Telegram messenger, we will also want to embed our dapp right into the Telegram app itself. Telegram provides special API for building [Telegam Web Apps](https://core.telegram.org/bots/webapps) (TWAs). These tiny apps closely resemble websites and also rely on HTML and JavaScript. They normally run within the context of a Telegram bot and provide a sleek user experience without ever leaving the host Telegram app.

<video src="https://ton-community.github.io/tutorials/assets/twa.mp4" loop muted autoplay playsinline width=300></video><br>

During the course of this tutorial we will create a single codebase that will accomodate both usage patterns.

## Step 2: Set up your local machine

Before we can start writing code, we need to install certain developer tools on our computer.

Since our frontend will run inside a browser, it will be implemented in JavaScript. The most convenient runtime for developing JavaScript projects is Nodejs. The installation instructions are [here](https://nodejs.org/). We will need a fairly recent version of node like v16 or v17. You can verify your nodejs version by running `node -v` in terminal.

The second tool we need is an initialized TON wallet like [Tonkeeper](https://tonkeeper.com). If you don't have a wallet, please take a look at tutorial 1. The wallet will communicate with our dapp via a protocol called [TON Connect 2](https://github.com/ton-connect). If you choose a different wallet than Tonkeeper, please verify it supports this version of TON Connect. Don't forget to make sure your wallet is connected to the correct network - mainnet or testnet.

## Step 3: Set up the project

We will build our frontend with [React](https://reactjs.org/). To create our project we will rely on [Vite](https://vitejs.dev/) and its React template. Choose a name for your project, for example `my-twa`, then open terminal and run the following:

```console
npm create vite@latest my-twa -- --template react-ts
cd my-twa
npm install
```

We will need to install a few more packages that will allow us to interact with TON Blockchain. We've seen these packages in action in the previous tutorial. Run the following in terminal:

```console
npm install @ton/ton @ton/core @ton/crypto
npm install @orbs-network/ton-access
```

Last but not least, we will need to overcome [ton](https://www.npmjs.com/package/ton) library's reliance on Nodejs `Buffer` that isn't available in the browser. We can do that by installing a polyfill. Run the following in terminal:

```console
npm install vite-plugin-node-polyfills
```

Now modify the file `vite.config.ts` so it looks like this:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  base: '/',
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
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
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
import './App.css';
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

Then refresh the web browser viewing the URL shown on-screen. I'm assuming you're using the web browser on your desktop (where you're developing) and your Tonkeeper wallet is installed on your mobile device. Click "Connect Wallet" on the desktop and choose "Tonkeeper" (or any other supporting wallet you're using).

TON Connect supports both mobile-mobile user flows and desktop-mobile user flows. Since development is a desktop-mobile flow, TON Connect will rely on scanning QR codes in order to communicate with the wallet running on your mobile device. Open the Tonkeeper mobile app, tap the QR button on the top right and scan the code from your desktop screen.

If everything is wired properly, you should see a confirmation dialong in the wallet mobile app. If you approve the connection, you will see your address in the web app UI!

## Step 6: Read the counter value from the chain

It's time to interact with our Counter contract and show the current counter value. To do that, we will need the TypeScript interface class that we created in tutorial 2. This class is useful because it defines all possible interactions with the contract in a manner that abstracts implementation and encoding details. This is particularly useful when you have one developer in your team that writes the contract and a different developer that builds the frontend.

Copy `counter.ts` from tutorial 2 to `src/contracts/counter.ts` (also available [here](https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/src/contracts/counter.ts)).

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

Next, we're going to create another React hook that will rely on `useAsyncInitialize` and will initialize an RPC client in our app. An RPC service provider similar to [Infura](https://infura.io) on Ethereum will allow us to query data from the chain. These providers run TON Blockchain nodes and allow us to communicate with them over HTTP. [TON Access](https://orbs.com/ton-access) is an awesome service that will provide us with unthrottled API access for free. It's also decentralized, which is the preferred way to access the network.

Create the file `src/hooks/useTonClient.ts` with the following content:

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

Our final hook will open the Counter contract instance on-chain by address and allow the app to access it. When our frontend developer starts working on the client, the contract should already be deployed. This means all they need to access it is the deployment address. We've done the deployment in tutorial 2 step 8. The address we got was `EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb` but yours should be different.

Create the file `src/hooks/useCounterContract.ts` with the following content. Be sure to replace our deployed contract address with yours in the code below:

```ts
import { useEffect, useState } from 'react';
import Counter from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, OpenedContract } from '@ton/core';

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | number>();
  
  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse('EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb') // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      setVal(null);
      const val = await counterContract.getCounter();
      setVal(Number(val));
    }
    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
  };
}
```

We're almost done. Let's add some simple UI to show this information on the main app screen. Replace `src/App.tsx` with the following content:

```ts
import './App.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useCounterContract } from './hooks/useCounterContract';

function App() {
  const { value, address } = useCounterContract();

  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />

        <div className='Card'>
          <b>Counter Address</b>
          <div className='Hint'>{address?.slice(0, 30) + '...'}</div>
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{value ?? 'Loading...'}</div>
        </div>
      </div>
    </div>
  );
}

export default App
```

To rebuild the web app, run in terminal:

```console
npm run dev
```

Then refresh the web browser viewing the URL shown on-screen. You should see both the counter address and the counter value taken from the chain on the main screen. As you recall, we initialized the counter value to a very large value (number of milliseconds since the epoch, something like 1674271323207). Don't worry about styling, we will handle this later.

If you have network connectivity issues and get errors like backend nodes unhealthy or timeouts, please join the [Telegram support chat](https://t.me/TONAccessSupport) for TON access to get assistance.

## Step 7: Increment the counter on-chain

The last interaction was read-only, let's change the contract state by sending a transaction. The main action our counter contract supports is *increment*. Let's add a button to the main screen that sends this transaction. As you recall, sending a transaction on-chain costs gas, so we would expect the wallet to approve this action with the user and show how much TON coin will be spent.

Before starting, we're going to add another hook that will generate a `sender` object from the TON Connect interface. This sender represents the connected wallet and will allow us to send transactions on their behalf. While we're at it, we'll also expose the wallet connection state so we can alter the UI accordingly.

Create the file `src/hooks/useTonConnect.ts` with the following content:

```ts
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Sender, SenderArguments } from '@ton/core';

export function useTonConnect(): { sender: Sender; connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();

  return {
    sender: {
      send: async (args: SenderArguments) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString('base64'),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
        });
      },
    },
    connected: tonConnectUI.connected,
  };
}
```

The next thing we're going to do is improve our existing `useCounterContract` hook and add two small features. The first is automatic polling of the counter value every 5 seconds. This will come in handy to show the user that the value indeed changed. The second is exposing the `sendIncrement` of our interface class and wiring it to the `sender`.

Open the file `src/hooks/useCounterContract.ts` and replace its contents with:

```ts
import { useEffect, useState } from 'react';
import Counter from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | string>();
  const { sender } = useTonConnect();

  const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
  
  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse('EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb') // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      setVal(null);
      const val = await counterContract.getCounter();
      setVal(val.toString());
      await sleep(5000); // sleep 5 seconds and poll value again
      getValue();
    }
    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: () => {
      return counterContract?.sendIncrement(sender);
    },
  };
}
```

We're almost done. Let's add simple UI to allow the user to trigger the increment. Replace `src/App.tsx` with the following content:

```ts
import './App.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from './hooks/useTonConnect';
import { useCounterContract } from './hooks/useCounterContract';

function App() {
  const { connected } = useTonConnect();
  const { value, address, sendIncrement } = useCounterContract();

  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />

        <div className='Card'>
          <b>Counter Address</b>
          <div className='Hint'>{address?.slice(0, 30) + '...'}</div>
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{value ?? 'Loading...'}</div>
        </div>

        <a
          className={`Button ${connected ? 'Active' : 'Disabled'}`}
          onClick={() => {
            sendIncrement();
          }}
        >
          Increment
        </a>
      </div>
    </div>
  );
}

export default App
```

Time to rebuild the web app, run in terminal:

```console
npm run dev
```

Then refresh the web browser viewing the URL shown on-screen. You should see a new "Increment" link on the bottom of the screen. I'm assuming that you're still on desktop, make a note of the counter value and click the link. 

Since your mobile Tonkeeper wallet is connected, this action should reach the Tonkeeper mobile app and cause it to display a confirmation dialog. Notice that this dialog shows the gas cost of the transaction. Approve the transaction on the mobile app. Since the app and wallet are connected, your approval should reach the app and cause it to display an indication that the transaction was sent. As you recall, new transactions must wait until they're included in a block, so this should take 5-10 seconds.

If everything is working, the counter value on screen should refresh automatically and you should see a value that is higher by one.

## Step 8: Style the app

Functionally our app is working, but we can definitely improve what it looks like. Giving a polished user experience is particularly important on TON Blockchain. We are aiming to reach mass adoption and the next billion users. We won't succeed unless our apps look as polished as the ones these users are already using.

Replace `src/index.css` with the following content:

```css
:root {
  --tg-theme-bg-color: #efeff3;
  --tg-theme-button-color: #63d0f9;
  --tg-theme-button-text-color: black;
}

.App {
  height: 100vh;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
}

.Container {
  padding: 2rem;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin: 0 auto;
  text-align: center;
}

.Button {
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  display: inline-block;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.Disabled {
  filter: brightness(50%);
  cursor: initial;
}

.Button.Active:hover {
  filter: brightness(105%);
}

.Hint {
  color: var(--tg-theme-hint-color);
}

.Card {
  width: 100%;
  padding: 10px 20px;
  border-radius: 10px;
  background-color: white;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tg-theme-bg-color: #131415;
    --tg-theme-text-color: #fff;
    --tg-theme-button-color: #32a6fb;
    --tg-theme-button-text-color: #fff;
  }

  .Card {
    background-color: var(--tg-theme-bg-color);
    filter: brightness(165%);
  }

  .CounterValue {
    border-radius: 16px;
    color: white;
    padding: 10px;
  }
}
```

As usual, to rebuild the web app, run in terminal:

```console
npm run dev
```

And refresh the web browser viewing the URL shown on-screen. Our app should look pretty now.

Up until now we used our app in a desktop-mobile flow due to the development cycle. It would be nice to try our app in a mobile-mobile flow. This means we need to open the app's web page from a mobile device. This will be much easier to do after our web app is published to the Internet.

## Step 9: Publish web app to GitHub Pages

I believe that the best place to publish dapps is [GitHub Pages](https://pages.github.com/) - not just for development but also for production. GitHub Pages is a free service for open source projects that allows them to publish static websites (HTML/CSS/JS) directly from a GitHub repo. Since all dapps should always be [open source](https://defi.org/ton/#app-safety-guidelines), all dapps qualify. GitHub Pages also supports [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), so the end result will be identical to any other production publishing service.

Another benefit of GitHub Pages is that it supports static websites only that only run client-side. There's no backend that can run code or server-side rendering. This limitation is actually a feature for dapps, because decentralized apps should never depend on backend servers as those are centralized.

The last important feature of GitHub Pages that makes it particularly appropriate for dapps is that the reliance on a git repo gives us many community governance features for free. For example, a group of maintainers can share the website deployment privilege easily because all of them have write access to the repo. Outside collaborators from the community can submit PRs and if those are merged, these community members can influence the live dapp. And lastly, if anyone from the community is unhappy with how the dapp is governed, they can always fork the GitHub repo and create their own independent client that can also be published to GitHub Pages in one click.

Let's assume that your GitHub username is `my-gituser` and that you pushed the client project to a GitHub repo named `my-twa` under this user. The GitHub URL of the repo is therefore `https://github.com/my-gituser/my-twa`. You will naturally have to replace the names in this example with the actual names that you're using.

Unless you connect a custom domain to GitHub Pages, the website will be published under the URL:

```console
https://my-gituser.github.io/my-twa
```

Since we're about to go live, it's time to use a proper TON Connect [manifest](https://github.com/ton-connect/sdk/tree/main/packages/sdk#add-the-tonconnect-manifest). This will allow us to style the initial connection dialog that appears in wallets like Tonkeeper.

Create the file `public/tonconnect-manifest.json` with this content:

```json
{
  "url": "https://my-gituser.github.io/my-twa",
  "name": "My TWA",
  "iconUrl": "https://my-gituser.github.io/my-twa/icon.png"
}
```

Replace the URL field with your webite URL and choose a short name of your dapp. For icon, create a PNG file 180x180 pixels in size and put it under `public/icon.png`.

After we publish the website, this manifest file will be available at:

```console
https://my-gituser.github.io/my-twa/tonconnect-manifest.json
```

Edit `src/main.tsx` and replace the constant `manifestUrl` with the future URL of your manifest:

```ts
const manifestUrl = 'https://my-gituser.github.io/my-twa/tonconnect-manifest.json';
```

Another step to remember is changing the `base` property of the Vite config file. If your future website is not going to be on the root of the domain (like you normally have with a custom domain), you must set `base` to the root directory of the website under the domain. In the example above, since the repo name is `my-twa` and the URL is `https://my-gituser.github.io/my-twa`, the website is published under the directory `/my-twa/` in the domain.

Let's set this in `vite.config.js`:

```ts
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  base: '/my-twa/',
});
```

Build the website for publishing by running in terminal:

```console
npm run build
```

Publishing to GitHub Pages is pretty straightforward. You would normally create a git branch named `gh-pages` in your repo that contains the static website files that were generated in the `dist` directory during the build. Then you would normally open the repo on GitHub's web UI and enable "Pages" under "Settings" (pointing the "Branch" to "gh-pages" after it is pushed).

For the exact steps, you can follow Vite's tutorial for [Deploying to GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages).

Once the website is published, we can finally access it from mobile. Take your mobile device and open the URL `https://my-gituser.github.io/my-twa` in the mobile browser.

This is a good opportunity to try the mobile-mobile flow. In the mobile browser, tap on the "Connect Wallet" button and choose "Tonkeeper" (or any other supporting wallet you're using). This should switch you to the Tonkeeper mobile app where you can approve the connection. After approval, you should be switched back to the website. Now tap the "Increment" button. This should switch you to the Tonkeeper mobile app where you can approve the transaction. As you can see, in the mobile-mobile flow there are no QR codes involved since the dapp and the wallet run on the same device.

## Step 10: Publish web app as TWA in Telegram

Having our dapp accessible through a web browser is not enough. We want to make the most from the seamless integration into Telegram messenger. To feature our dapp in Telegram, we will also have to publish it as a TWA. Luckily, this is pretty easy to do.

The first step is to add the [TWA SDK](https://github.com/twa-dev) to our project. This will allow us to get theme properties while inside Telegram. Run in terminal:

```console
npm install @twa-dev/sdk
```

Then, edit `src/App.tsx` and add the following import:

```ts
import '@twa-dev/sdk';
```

Now rebuild the website for publishing by running in terminal:

```console
npm run build
```

Publish the updated website like we did in step 9, probably just by pushing it to git to the correct branch.

The final step is to create a new Telegram bot and have it showcase our website when opened. To do that we will interact with another Telegram bot called "botfather". On a device where your Telegram messenger is logged in, open [https://t.me/botfather](https://t.me/botfather) and then switch to the bot inside the Telegram app. Choose "Start".

To create a new bot select "/newbot". Choose a name for the bot and then a username according to the on-screen instructions. Make a note of the username since this is how end-users will access your TWA. Assuming that your bot username is `my_twa_bot`, it will be accessible in the Telegram chat by typing `@my_twa_bot` or through the URL [https://t.me/my_twa_bot](https://t.me/my_twa_bot). You can even purchase a premium Telegram username for your bot on the auction platform [Fragment](https://fragment.com).

Back in botfather, tap the menu button and edit your bots by selecting "/mybots". Select the bot you've just created. Select "Bot Settings" and then select "Menu Button". Now select "Configure menu button" to edit the URL and type your published website URL:

```console
https://my-gituser.github.io/my-twa
```

That's it! The bot should be ready. Start a Telegram chat with your bot via the username. Tap the menu button and voila - your published website will open inside Telegram as a TWA. Congratulations!

<img src="https://i.imgur.com/lVL1Bl0.png" width=300/><br>

## Reward

Congratulations on successfully completing this tutorial! Before we conclude, let's take a quick look at the exciting reward awaiting you from the <a target="_blank" href="https://getgems.io/collection/EQBCaHNBo6KrAmyq6HdEB-rwxvRufrPTHd3VygbHcx4DisCt">"TON Masters"</a> collection:
<video style="border-radius: 10pt; margin: 25pt auto; display: block;" width="40%" autoplay loop muted playsinline>
  <source src="https://ton-devrel.s3.eu-central-1.amazonaws.com/tal-tutorials/3-twa/video.mp4" type="video/mp4">
</video>

Ready to claim your reward? Simply scan the QR code below or click <a href="ton://transfer/EQCZ52LU4PsK71IVjn4Ur599R4ZdsnT9ToAEqysot628BEdo?bin=te6cckEBAQEABgAACAD0yCaOQwnT&amount=50000000">here</a>:
<img src="https://i.imgur.com/0UJOtIH.png" width=300 alt="QR-code" style="display: block; margin-left: auto; margin-right: auto; width: 50%;"/>

## Conclusion

For your convenience, all the code in this tutorial is available in executable form [here](https://github.com/ton-community/tutorials/blob/main/03-client/test).

In this tutorial we created our project skeleton manually, mostly so we can understand what happens under the hood. When creating a new client project, you can start from a ready-made template that will save you most of the setup work:<br>[https://github.com/ton-community/twa-template](https://github.com/ton-community/twa-template)

If you found a mistake in this tutorial, please [submit a PR](https://github.com/ton-community/tutorials/pulls) and help us fix it. This tutorial platform is fully open source and available on [https://github.com/ton-community/tutorials](https://github.com/ton-community/tutorials).

Happy coding!
