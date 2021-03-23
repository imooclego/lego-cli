/* （commander框架的）command-action回调逻辑
 * 实例化Package类
 * 安装/更新命令对应的npm包
 * 运行该npm包
 */

"use strict";

module.exports = exec;
const path = require("path");
const Package = require("@imooc-lego/cli-models-package");
const { commanderActionArgsParse, deepcopy } = require("@imooc-lego/cli-utils");
const cp = require("child_process");
const log = require("@imooc-lego/cli-utils-log");

const SETTING = {
  init: "@imooc-lego/cli-init",
};
const CACHE_DIR = "dependencies";

async function exec() {
  let pkg;
  const {
    commandParams,
    commandOptions,
    commandObject,
  } = commanderActionArgsParse(arguments);
  const packageName = SETTING[commandObject.name()];
  let targetPath = process.env.LEGO_CLI_TARGET;
  let storeDir = "";
  let homePath = process.env.LEGO_CLI_HOME;

  /* 实例化Package类
   * 走缓存目录模式（传入option:targetPath）下，还需要自动更新或安装包
   */
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
    });
    if (await pkg.exists()) {
      // 更新逻辑
      await pkg.update();
    } else {
      // 安装逻辑
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
    });
  }

  // 获取包的入口文件
  const rootFile = pkg.getRootFilePath();
  // 执行
  if (rootFile) {
    // 子进程中调用包
    try {
      const args = { commandParams, commandOptions };
      const code = `require("${rootFile}").call(null, ${JSON.stringify(args)})`;
      const child = cp.spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.verbose("命令执行成功", e);
      });
    } catch (e) {
      log.error(e);
    }
  }
}
