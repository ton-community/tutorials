import fs from "fs";
import ejs from "ejs";
import showdown from "showdown";

console.log("Searching for tutorials..");

fs.rmSync("docs", { recursive: true, force: true });
fs.mkdirSync("docs");
fs.copyFileSync("scripts/assets/index.html", "docs/index.html");
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
    const optionsArray: string[] = [];
    const optionsValuesArray: string[][] = [];
    try {
      options = JSON.parse(fs.readFileSync(`${tutorial}/options.json`).toString());
      for (const option in options) optionsArray[options[option].order - 1] = option;
      findOptions([], 0, optionsArray, options, tutorial, optionsValuesArray);
    } catch (e) {}

    // convert md to html
    convertMdsToHtmls(tutorial);

    // create index.html
    let author;
    try {
      author = JSON.parse(fs.readFileSync(`${tutorial}/author.json`).toString());
    } catch (e) {}
    if (optionsArray.length > 0) {
      const html = generateTutorialHtml(options, optionsArray, optionsValuesArray, tutorial, author);
      fs.writeFileSync(`docs/${tutorial}/index.html`, html);
    }
  }
}

function findOptions(combination: string[], i: number, optionsArray: string[], options: any, tutorial: string, optionsValuesArray: string[][]) {
  if (i >= optionsArray.length) {
    handleCombination(combination, optionsArray, options, tutorial);
    return;
  }
  const option = optionsArray[i];
  const valuesArray: string[] = [];
  for (const value in options[option].options) valuesArray[options[option].options[value].order - 1] = value;
  optionsValuesArray[i] = valuesArray;
  for (const value of valuesArray) {
    findOptions(combination.concat([value]), i+1, optionsArray, options, tutorial, optionsValuesArray);
  }
}

function handleCombination(combination: string[], optionsArray: string[], options: any, tutorial: string) {
  const filename = combination.join("-");
  console.log(` Creating docs/${tutorial}/${filename}.md`);
  let content = fs.readFileSync(`${tutorial}/index.md`).toString();
  for (let i=0; i<optionsArray.length; i++) {
    const option = optionsArray[i];
    for (const value in options[option].options) {
      if (value != combination[i]) {
        // remove option:value
        content = content.replace(new RegExp("\-\-\-\n[^\n]*" + option + "\:" + value + "[^\n]*\n\-\-\-\n(.*?)\n\-\-\-\n", "sg"), "");
      }
    }
  }
  // keep everything else
  content = content.replace(/\-\-\-\n[\w\:\s]+\w+\n\-\-\-\n(.*?)\n\-\-\-\n/sg, "$1");
  content = content.replace(/\n\n+/sg, "\n\n");
  fs.writeFileSync(`docs/${tutorial}/${filename}.md`, content);
}

function convertMdsToHtmls(tutorial: string) {
  const files = fs.readdirSync(`docs/${tutorial}`);
  for (const file of files) {
    if (file.endsWith(".md")) {
      const filename = file.split(".")[0];
      const text = fs.readFileSync(`docs/${tutorial}/${file}`).toString();
      const converter = new showdown.Converter({
        literalMidWordUnderscores: true,
      });
      const html = converter.makeHtml(text);
      fs.writeFileSync(`docs/${tutorial}/${filename}.html`, html);
    }
  }
}

function generateTutorialHtml(options: any, optionsArray: string[], optionsValuesArray: string[][], tutorial: string, author: any) {
  const markdowns: {[key: string]: string} = {};
  const htmls: {[key: string]: string} = {};
  const files = fs.readdirSync(`docs/${tutorial}`);
  for (const file of files) {
    const filename = file.split(".")[0];
    if (file.endsWith(".md")) {
      markdowns[filename] = fs.readFileSync(`docs/${tutorial}/${file}`).toString();
      htmls[filename] = modifyCombinationHtml(fs.readFileSync(`docs/${tutorial}/${filename}.html`).toString(), author);
    }
  }
  let title = "";
  for (const markdown in markdowns) {
    title = markdowns[markdown].match(/^#\s*(.+)$/m)?.[1] ?? "TON Tutorial";
  }
  const template = ejs.compile(fs.readFileSync("scripts/index-template.ejs").toString());
  const data = {
    title,
    options,
    optionsArray,
    optionsValuesArray,
    markdowns,
    htmls,
  };
  return template(data);
}

function modifyCombinationHtml(html: string, author: any) {
  if (author) {
    const template = ejs.compile(fs.readFileSync("scripts/author-template.ejs").toString());
    html = html.replace("</h1>\n", "</h1>\n" + template(author) + "\n");
  }
  return html;
}