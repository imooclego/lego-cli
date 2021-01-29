#!/usr/bin/env node

const importLocal = require("import-local");
const log = require("npmlog");

// if (importLocal(__filename)) {
//   log.info("cli", "if");
// } else {
//   log.info('cli', 'else');
//   console.log(require("../lib")(process.argv.slice(2)));
// }

require("npmlog").info("cli", "运行npmlog");
console.log("npmlog.info为什么就打印不出来呢?");
