npm init es6 --yes
npm set-script watch "sass -w styles.scss docs/assets/styles.css"
npm install ejs
npm install sass
node scripts/build.js
npm run watch
