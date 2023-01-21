npm init --yes
npm install dotenv
npm install ts-node
npm install @ton-community/func-js
npm install ton ton-core ton-crypto
npm install @orbs-network/ton-access
npx func-js stdlib.fc counter.fc --boc counter.cell
npx ts-node deploy.step8.ts > deploy.step8.output.txt
diff deploy.step8.output.txt deploy.step8.expected.txt