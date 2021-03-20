/* init命令 */

"use strict";

const Command = require("@imooc-lego/cli-models-command");
const log = require("@imooc-lego/cli-utils-log");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._options.force;
    // log.verbose("projectName", this.projectName);
    // log.verbose("force", this.force);
  }
  exec() {}
}
function init(projectName, commandOptions, commandObjet) {
  return new InitCommand([projectName, commandOptions, commandObjet]);
}
init.InitCommand = InitCommand;
module.exports = init;
