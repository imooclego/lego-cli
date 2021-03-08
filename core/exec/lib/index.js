"use strict";

module.exports = exec;
const path = require("path");
const Package = require("@imooc-lego/cli-models-package");
const SETTING = {
  init: "@imooc-lego/cli-init",
};
const CACHE_DIR = "dependencies";

async function exec() {
  let pkg;
  const commandParams = Array.prototype.slice.call(
    arguments,
    0,
    arguments.length - 2
  );
  const [commandOptions, commandObject] = Array.prototype.slice.call(
    arguments,
    arguments.length - 2
  );
  const packageName = SETTING[commandObject.name()];
  let targetPath = process.env.LEGO_CLI_TARGET;
  let storeDir = "";
  let homePath = process.env.LEGO_CLI_HOME;

  // 走缓存目录模式（传入option:targetPath），还是不走缓存模式
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

  /* 获取入口文件，并且调用 */
  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    // 在当前进程中调用（无法充分利用cpu资源）
    require(rootFile).apply(null, Array.from(arguments));
  }
}
