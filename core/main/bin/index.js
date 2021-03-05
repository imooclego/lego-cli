#!/usr/bin/env node
const importLocal = require("import-local");

if (importLocal(__filename)) {
  console.log("cli", "正在使用脚手架的本地版本");
} else {
  require("../lib")(process.argv.slice(2));
}
