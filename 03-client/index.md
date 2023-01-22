
1. Create the project using vite
```
npm create vite@latest my-twa -- --template react-ts
cd my-twa
npm install
npm install ton ton-crypto ton-core
npm install @orbs-network/ton-access
```

2. Install ton connect

```
npm i @tonconnect/ui-react
```

3. Put a `tonconnect-manifest.json` in your `public` folder

```
{
  "url": "https://google.com",
  "name": "HI",
  "iconUrl": "https://tonverifier.live/tonverifier.png"
}
```

4. Modify your main.tsx:

```
// TODO - how to get around the manifest thing?
<TonConnectUIProvider manifestUrl="https://tonverifier.live/tonconnect-manifest.json">
    <App />
  </TonConnectUIProvider>
```

5. Replace your `<App/>` code:
```
function App() {
  return (
      <div>
        <TonConnectButton />
      </div>
  );
}
```

6. Add the OpenedContract type (TEMP)

```
type OpenedContract<F> = {
  [P in keyof F]: P extends `${"get" | "send"}${string}`
    ? F[P] extends (x: ContractProvider, ...args: infer P) => infer R
      ? (...args: P) => R
      : never
    : F[P];
};
```

7. Add the ton client hook:

---
network:mainnet
---
```
function useTonClient() {
  const [tonClient, setTonClient] = useState<TonClient | undefined>();
  useEffect(() => {
    (async () => {
      const tc = new TonClient({
        endpoint: await getHttpEndpoint(),
      });
      setTonClient(tc);
    })();
  }, []);

  return tonClient;
}
```
---

---
network:testnet
---
```
function useTonClient() {
  const [tonClient, setTonClient] = useState<TonClient | undefined>();
  useEffect(() => {
    (async () => {
      const tc = new TonClient({
        endpoint: await getHttpEndpoint({ network: "testnet" }),
      });
      setTonClient(tc);
    })();
  }, []);

  return tonClient;
}
```
---

8. Add the `useSender` hook so we can provide it to the opened Counter class

```
function useSender(): Sender {
  const [tonConnectUI] = useTonConnectUI();

  return {
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
  };
}
```

2. Add the useCounterContract hook
```
function useCounterContract() {
  const tc = useTonClient();
  const [ctrct, setCtrct] = useState<OpenedContract<Counter> | undefined>();
  const [val, setVal] = useState<null | number>();
  const sender = useSender();

  useEffect(() => {
    (async () => {
      if (!tc) return;
      const contract = new Counter(
        Address.parse("EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb")
      );
      const counterContract = tc.open(contract);
      setCtrct(counterContract);
    })();
  }, [tc]);

  useEffect(() => {
    setInterval(async () => {
      if (!ctrct) return;
      setVal(null);
      const val = await ctrct.getCounter();
      setVal(Number(val));
    }, 3000);
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

9. Update your App.tsx

```
function App() {
  const { sendIncrement, value, address } = useCounterContract();

  return (
    <div className="App">
      <h1 style={{ marginBottom: 8 }}>Counter TON Dapp</h1>
      <TonConnectButton />

      <div>{address?.slice(0, 25) + "..."}</div>
      {<div>Value: {value ?? "Loading..."}</div>}
      <div
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "#248bda",
          borderRadius: 16,
          marginTop: 12,
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
        }}
        onClick={() => {
          sendIncrement();
        }}
      >
        Increment
      </div>
    </div>
  );
}
```