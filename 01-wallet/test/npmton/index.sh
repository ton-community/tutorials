npm init es6 --yes
npm install dotenv
npm install ton ton-core ton-crypto
node read.js > read.output.txt
diff read.output.txt read.expected.txt
node write.js