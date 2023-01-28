rm -rf ./temp
npm create vite@latest temp -- --template react-ts
cd temp
npm install
npm install ton ton-core
npm install @orbs-network/ton-access
npm install vite-plugin-node-polyfills
cp -f ../vite.config.ts .
npm install @tonconnect/ui-react
cp -f ../src/main.tsx ./src
cp -f ../src/App.step5.tsx ./src/App.tsx
npm run build
mkdir ./src/contracts
cp -f ../src/contracts/counter.ts ./src/contracts
mkdir ./src/hooks
cp -f ../src/hooks/useAsyncInitialize.ts ./src/hooks
cp -f ../src/hooks/useTonClient.ts ./src/hooks
cp -f ../src/hooks/useCounterContract.step6.ts ./src/hooks/useCounterContract.ts
cp -f ../src/App.step6.tsx ./src/App.tsx
npm run build
cp -f ../src/hooks/useTonConnect.ts ./src/hooks
cp -f ../src/hooks/useCounterContract.step7.ts ./src/hooks/useCounterContract.ts
cp -f ../src/App.step7.tsx ./src/App.tsx
cp -f ../src/index.css ./src
cp -f ../public/tonconnect-manifest.json ./public
npm run build
npm install @twa-dev/sdk
cp -f ../src/App.step10.tsx ./src/App.tsx
npm run build