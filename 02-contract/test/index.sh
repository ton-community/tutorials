set -ev
npm init --yes
npm install dotenv
npm install ts-node
npm install @ton-community/func-js
npm install ton ton-core ton-crypto
npm install @orbs-network/ton-access
npx func-js stdlib.fc counter.fc --boc counter.cell
npx ts-node deploy.step8.ts > deploy.step8.output.txt
COUNTER_ADDRESS=`cut -d : -s  -f 2 < deploy.step8.output.txt` npx ts-node step9.ts > step9.output.txt
diff step9.output.txt step9.expected.txt
COUNTER_ADDRESS=`cut -d : -s  -f 2 < deploy.step8.output.txt` npx ts-node step10.ts > step10.output.txt
diff step10.output.txt step10.expected.txt