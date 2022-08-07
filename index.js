#! /usr/bin/env node
const Booklet = require("./Booklet");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const inquirer = require("inquirer");
const argv = yargs(hideBin(process.argv)).argv;

const questions = [
  {
    type: "confirm",
    name: "hasCover",
    message: "Does it has a cover?",
    default: false,
  },
  {
    type: "input",
    name: "removePages",
    message: "Input pages to remove as a string. You can use (,) and (-) to specify individual pages and ranges respectively. Use PDF page numeration.",
    default: "",
  }
];

async function main() {
  const srcFilename = argv._[0];
  const destFilename = argv._[1] ? argv._[1] : srcFilename.replace(".pdf", "-booklet.pdf");

  const answers = await inquirer.prompt(questions);

  const bk = new Booklet(srcFilename, destFilename);
  await bk.init();
  
  if (answers.hasCover) await bk.saveCover(srcFilename.replace(".pdf", "-cover.pdf"))
  await bk.removePages(answers.removePages);

  await bk.create();
  await bk.save();
}

main();



