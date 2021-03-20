/* （commander框架的）command-action回调逻辑
 * 实例化Package类
 * 安装/更新命令对应的npm包
 * 运行该npm包
 */

"use strict";

module.exports = exec;
const path = require("path");
const Package = require("@imooc-lego/cli-models-package");
const { commanderActionArgsParse } = require("@imooc-lego/cli-utils");

const SETTING = {
  init: "@imooc-lego/cli-init",
};
const CACHE_DIR = "dependencies";

async function exec() {
  let pkg;
  const { commandObject } = commanderActionArgsParse(arguments);
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
    // 在当前进程中调用（无法充分利用cpu资源）
    try {
      require(rootFile).apply(null, Array.from(arguments));
    } catch (e) {
      console.log(e);
    }
  }
}
