set -ev
npm init --yes
npm install dotenv
npm install typescript jest @types/jest ts-jest
npm install ton-core @ton-community/sandbox @ton-community/test-utils
npx jest step2
npx jest step3
npx jest step4
npx jest step5 | grep "#DEBUG#" > step5.output.txt
diff step5.output.txt step5.expected.txt