set -ev
npm init --yes
npm install dotenv
npm install ts-node
npm install @ton-community/func-js
npm install @ton/ton @ton/core @ton/crypto
npm install @orbs-network/ton-access
npx func-js stdlib.fc counter.fc --boc counter.cell
npx ts-node deploy.step8.ts > deploy.step8.output.txt
COUNTER_ADDRESS=`cut -d : -s  -f 2 < deploy.step8.output.txt` npx ts-node getCounter.ts > getCounter.output.txt
diff getCounter.output.txt getCounter.expected.txt
COUNTER_ADDRESS=`cut -d : -s  -f 2 < deploy.step8.output.txt` npx ts-node sendIncrement.ts > sendIncrement.output.txt
diff sendIncrement.output.txt sendIncrement.expected.txt