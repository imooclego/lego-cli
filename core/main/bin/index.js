#!/usr/bin/env node

const importLocal = require("import-local");

// if (importLocal(__filename)) {
//   console.log("cli", "正在使用脚手架的本地版本");
// } else {
//   require("../lib")(process.argv.slice(2));
// }

/* 获取commander的单例 */
// const { program } = require("commander");

/* 实例化一个commander */
const { Command } = require("commander");
const program = new Command();
const help = require("./help");

/* 主流程 */
(async function main() {
  /* 配置全局option */
  program
    .version("0.0.1")
    .option("-c, --config <path>", "set config path", "./deploy.conf");
  /* 配置命令 */
  program
    .command("abc [a] [b]")
    .alias("t")
    .description("test's desc")
    .option("-s, --setup_mode <c>", "Which setup mode to use", "normal")
    .option("-t, --title [d]", "Which setup mode to use", "normal")
    .action(abc)
    .addHelpText("afterAll", help.test);

  /* 配置剩余命令 */
  program
    .arguments("<cmd1> [x] [y]") // 指定规范：命令和参数的名称和数量
    .option("-d, --debug", "display some debugging") // 共同的参数定义
    .action((cmd1, x, y, options, command) => {
      console.log("cmd1:", cmd1);
      console.log("x:", x);
      console.log("y:", y);
      console.log("options:", options);
    });
  /* 解析参数 */
  await program.parseAsync(process.argv);
})();

/* actions */
// 最后一项是optins，其余都是命令后的参数
async function abc(a, b, options) {
  console.log("a:", a);
  console.log("b:", b);
  console.log("options:", options);
  console.log(program);
}
