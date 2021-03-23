/* 命令的抽象类 */

"use strict";
const { commanderActionArgsParse, types } = require("@imooc-lego/cli-utils");

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("参数不能为空！");
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.initArgs(argv));
      chain = chain.then(() => this.init(argv));
      chain = chain.then(() => this.exec(argv));
      chain.catch((err) => {
        console.log("Command:", err.message);
      });
    });
  }
  /*  */
  initArgs(args) {
    const { commandParams, commandOptions } = args;
    this._params = commandParams;
    this._options = commandOptions;
    // this._cmd = commandObject;
  }
  init() {
    throw new Error("init方法未定义");
  }
  exec() {
    throw new Error("exec方法未定义");
  }
}

module.exports = Command;
