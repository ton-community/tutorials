import fs from "fs";

console.log("Searching for tutorials..");

fs.rmSync("docs", { recursive: true, force: true });
fs.mkdirSync("docs");

const dirs = fs.readdirSync(".", { withFileTypes: true });
for (const dir of dirs) {
  if (dir.isDirectory() && dir.name.match(/\d\d\-\w+/)) {
    const tutorial = dir.name;

    console.log(`Building '${tutorial}'`);
    fs.mkdirSync(`docs/${tutorial}`);
    try {
      const options = JSON.parse(fs.readFileSync(`${tutorial}/options.json`));
      const optionsArray = [];
      for (const option in options) optionsArray[options[option].order - 1] = option;
      findOptions([], 0, optionsArray, options, tutorial);
    } catch (e) {}
  }
}

function findOptions(combination, i, optionsArray, options, tutorial) {
  if (i >= optionsArray.length) {
    handleCombination(combination, optionsArray, options, tutorial);
    return;
  }
  const option = optionsArray[i];
  const valuesArray = [];
  for (const value in options[option].options) valuesArray[options[option].options[value].order - 1] = value;
  for (const value of valuesArray) {
    findOptions(combination.concat([value]), i+1, optionsArray, options, tutorial);
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
  content = content.replaceAll(/\-\-\-\n\w+\:\w+\n\-\-\-\n(.*?)\n\-\-\-\n/sg, "$1");
  fs.writeFileSync(`docs/${tutorial}/${filename}.md`, content);
}