import fs from "fs";
import ejs from "ejs";

console.log("Searching for tutorials..");

fs.rmSync("docs", { recursive: true, force: true });
fs.mkdirSync("docs");
fs.cpSync("scripts/assets", "docs/assets", { recursive: true, force: true });




const dirs = fs.readdirSync(".", { withFileTypes: true });
for (const dir of dirs) {
  if (dir.isDirectory() && dir.name.match(/\d\d\-\w+/)) {
    const tutorial = dir.name;

    console.log(`Building '${tutorial}'`);
    fs.mkdirSync(`docs/${tutorial}`);

    // copy options.json
    try {
      fs.copyFileSync(`${tutorial}/options.json`, `docs/${tutorial}/options.json`);
    } catch (e) {}

    // create all the md combinations
    let options;
    const optionsArray = [];
    const optionsValuesArray = [];
    try {
      options = JSON.parse(fs.readFileSync(`${tutorial}/options.json`));
      for (const option in options) optionsArray[options[option].order - 1] = option;
      findOptions([], 0, optionsArray, options, tutorial, optionsValuesArray);
    } catch (e) {}

    // create index.html
    if (optionsArray.length > 0) {
      const html = generateTutorialHtml(options, optionsArray, optionsValuesArray, tutorial);
      fs.writeFileSync(`docs/${tutorial}/index.html`, html);
    }
  }
}

function findOptions(combination, i, optionsArray, options, tutorial, optionsValuesArray) {
  if (i >= optionsArray.length) {
    handleCombination(combination, optionsArray, options, tutorial);
    return;
  }
  const option = optionsArray[i];
  const valuesArray = [];
  for (const value in options[option].options) valuesArray[options[option].options[value].order - 1] = value;
  optionsValuesArray[i] = valuesArray;
  for (const value of valuesArray) {
    findOptions(combination.concat([value]), i+1, optionsArray, options, tutorial, optionsValuesArray);
  }
}

function handleCombination(combination, optionsArray, options, tutorial) {
  const filename = combination.join("-");
  console.log(` Creating docs/${tutorial}/${filename}.md`);
  let content = fs.readFileSync(`${tutorial}/index.md`).toString();
  for (let i=0; i<optionsArray.length; i++) {
    const option = optionsArray[i];
    for (const value in options[option].options) {
      if (value != combination[i]) {
        // remove option:value
        content = content.replaceAll(new RegExp("\-\-\-\n[^\n]*" + option + "\:" + value + "[^\n]*\n\-\-\-\n(.*?)\n\-\-\-\n", "sg"), "");
      }
    }
  }
  // keep everything else
  content = content.replaceAll(/\-\-\-\n[\w\:\s]+\w+\n\-\-\-\n(.*?)\n\-\-\-\n/sg, "$1");
  content = content.replaceAll(/\n\n+/sg, "\n\n");
  fs.writeFileSync(`docs/${tutorial}/${filename}.md`, content);
}

function generateTutorialHtml(options, optionsArray, optionsValuesArray, tutorial) {
  const markdowns = {};
  const files = fs.readdirSync(`docs/${tutorial}`);
  for (const file of files) {
    if (file.endsWith(".md")) {
      markdowns[file.split(".")[0]] = fs.readFileSync(`docs/${tutorial}/${file}`).toString();
    }
  }
  const template = ejs.compile(fs.readFileSync("scripts/index-template.ejs").toString());
  const data = {
    options,
    optionsArray,
    optionsValuesArray,
    markdowns,
  };
  return template(data);
}

