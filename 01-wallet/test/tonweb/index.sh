set -ev
npm init --yes
npm install dotenv
npm install typescript
npx tsc --init
npm install ts-node
npm install tonweb tonweb-mnemonic
npm install @orbs-network/ton-access
npx ts-node step7.ts > step7.output.txt
diff step7.output.txt step7.expected.txt
npx ts-node step8.ts > step8.output.txt
diff step8.output.txt step8.expected.txt
npx ts-node step9.ts > step9.output.txt
diff step9.output.txt step9.expected.txt
