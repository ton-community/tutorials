npm init es6 --yes
npm install dotenv
npm install tonweb tonweb-mnemonic
node read.js > read.output.txt
diff read.output.txt read.expected.txt
node write.js