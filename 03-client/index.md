# Building your first web client

## Step 1 - Create a React project
Create the project using vite (a quick way of jumpstarting react)

```
npm create vite@latest my-twa -- --template react-ts
cd my-twa
npm install
npm install ton ton-crypto ton-core
npm install @orbs-network/ton-access
```

## Step 2 - Install Tonkeeper 
Install Tonkeeper on your mobile device. Go to https://tonkeeper.com/

---
network:testnet
---
Switch tonkeeper to testnet:
```
* go to ...
* tap 5 times on the version
* tap switch to testnet
```

---

## Step 3 - Add node.js polyfills
We need to polyfill node.js `Buffer` in order to work with TON in the browser. 

First, install the node.js polyfills.

```
npm install vite-plugin-node-polyfills
```
  
Modify `vite.config.ts` so it looks like this: 

```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
});
```

// TODO (tonweb?)

## Step 4 - Set up TON Connect
TON Connect is the dapp library to enable wallet interaction

Install ton connect UI. It's still in beta, but it will handle all wallet interaction for us:

* Getting the list of Ton-Connect2 supported wallets

* Getting the address from the wallet

* Sending a transaction through the wallet

```
npm i @tonconnect/ui-react
```

Now, add a `tonconnect-manifest.json` in your `public` folder with the following contents. 
Don't worry about the broken icon for now, in your production app you will just change it to a publicly available URL of your logo.

```
{
  "url": "https://telegram.org",
  "name": "My TWA",
  "iconUrl": "https://broken.png"
}
```

Push to github and take note of the raw URL for `tonconnect-manifest.json`. We will use this temporarily to enable connecting the dapp to the wallet.

Modify main.tsx to instruct the TON Connect provider to consume the manifest we just uploaded:

```typescript
import { TonConnectUIProvider } from '@tonconnect/ui-react';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TonConnectUIProvider manifestUrl="<GITHUB_TONCONNECT_MANIFEST_RAW_URL">
    <App />
  </TonConnectUIProvider>
);
```

## Step 5 - Connect to your wallet from the webapp

Replace your ```<App/>``` code
```
import { TonConnectButton } from '@tonconnect/ui-react';
...
function App() {
  return (
      <div>
        <TonConnectButton />
      </div>
  );
}
```

Run `npm run dev` and open your web app. You should be able to connect at this point with your wallet and view your address within the webapp.

## Step 6 - Interact with the Counter contract

Now we'll interact with the counter contract. Add to your project the `Counter` class from the previous tutorial.
In App.tsx, Add the OpenedContract type (TEMP - see this [PR](https://github.com/ton-community/ton-core/pull/6))

```
type OpenedContract<F> = {
  [P in keyof F]: P extends `${"get" | "send"}${string}`
    ? F[P] extends (x: ContractProvider, ...args: infer P) => infer R
      ? (...args: P) => R
      : never
    : F[P];
};
```

Add the following react hooks:

useAsyncInitialize - Will help us initialize dependencies
```
function useAsyncInitialize<T>(func: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<T | undefined>();

  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}
```

useTonClient - will help us interact with TON

---
network:mainnet
---
```
function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint(),
      })
  );
}
```
---

---
network:testnet
---
```
function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: "testnet" }),
      })
  );
}
```
---

useTonConnect - will expose whether we are connected with the wallet, and the Sender interface which is needed to send operations via our Counter class.
```
function useTonConnect(): { sender: Sender; connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();

  return {
    sender: {
      send: async (args: SenderArguments) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString("base64"),
              // TODO stateInit: args.init,
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // TODO
        });
      },
    },
    connected: tonConnectUI.connected,
  };
}
```

Add the useCounterContract hook, which will poll the counter value every 3 seconds and expose a function to send an increment op, using TON-Connect 2, to your wallet.

```
function useCounterContract() {
  const tc = useTonClient();
  const [val, setVal] = useState<null | number>();
  const { sender } = useTonConnect();

  const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  const ctrct = useAsyncInitialize(async () => {
    if (!tc) return;
    const contract = new Counter(
      Address.parse(<COUNTER_CONTRACT_ADDRESS>)
    );
    return tc.open(contract) as OpenedContract<Counter>;
  }, [tc]);

  useEffect(() => {
    async function getValue() {
      if (!ctrct) return;
      setVal(null);
      const val = await ctrct.getCounter();
      setVal(Number(val));
      await sleep(3000);
      getValue();
    }
    getValue();
  }, [ctrct]);

  return {
    sendIncrement: () => {
      return ctrct?.sendIncrement(sender);
    },
    value: val,
    address: ctrct?.address.toString(),
  };
}
```

Update your App.tsx

```
function App() {
  const { sendIncrement, value, address } = useCounterContract();
  const { connected } = useTonConnect();

  return (
    <div className="App">
      <div className="Container">
        <TonConnectButton />

        <div className="Card">
          <b>Counter Address</b>
          <div className="Hint">{address?.slice(0, 30) + "..."}</div>
        </div>

        <div className="Card">
          <b>Value</b>
          <div>{value ?? "Loading..."}</div>
        </div>
        <div
          className={`Button ${connected ? "Active" : "Disabled"}`}
          onClick={() => {
            sendIncrement();
          }}
        >
          Increment
        </div>
      </div>
    </div>
  );
}
```

## Step 7 - Style the app

First, delete content of your index.css file. Then, replace the contents of your App.css file with:
```
:root {
  --tg-theme-bg-color: #efeff3;
  --tg-theme-button-color: #63d0f9;
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
  background-color: #d8d8d8;
  color: #818181;
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
  }

  .Card {
    background-color: #202e3e;
  }

  .CounterValue {
    background-color: #282828;
    border-radius: 16px;
    color: white;
    padding: 10px;
  }

  .Disabled {
    background-color: #444;
    color: #818181;
  }
}
```

## Step 8 - Add the Telegram Web App SDK

Add the Telegram Web App SDK, so we can get theming properties from Telegram.
In your index.html file, under the <head> tag, add:

```
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

Create a Telegram bot.
* Go to botfather and create a bot
* Using ngrok(?), set the menu button URL
* Open within telegram