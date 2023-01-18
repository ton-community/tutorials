npm init es6 --yes
npm install dotenv
npm install tonweb tonweb-mnemonic
npm install @orbs-network/ton-access
node read.js > read.output.txt
diff read.output.txt read.expected.txt
node write.js > write.output.txt
diff write.output.txt write.expected.txt