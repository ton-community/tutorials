npm init --yes
npm install ts-node
npm install typescript
npx tsc --init --target es2020
npm pkg set scripts.watch="sass -w styles.scss docs/assets/styles.css"
npm install ejs @types/ejs
npm install sass
npm install showdown @types/showdown
npx ts-node scripts/build.ts
npm run watch
