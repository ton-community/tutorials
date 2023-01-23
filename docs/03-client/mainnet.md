
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

