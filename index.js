const Booklet = require("./Booklet")

async function main() {
  const bk = new Booklet("./assets/example-small.pdf", "./build/example.pdf");
  await bk.init();

  await bk.removePages("1")
  await bk.create()

  await bk.save();
}

main();



