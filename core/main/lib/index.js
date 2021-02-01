"use strict";

module.exports = main;
const semver = require("semver");
const colors = require("colors");
const log = require("@imooc-lego/cli-utils-log");
const pkg = require("../package.json");
const { LOWEST_NODE_VERSION } = require("./const");

function main(argv) {
  try {
    log.notice("CLI_VERSION", "v%s", chk_pkg_ver());
    log.notice("NODE_VERSION", "v%s", chk_node_ver());
  } catch (e) {
    log.error(e.message);
  }
}

function chk_pkg_ver() {
  return pkg.version;
}
function chk_node_ver() {
  // 获取当前node版本号
  const { version } = process;
  // 比对最低要求版本号
  if (semver.gte(version, LOWEST_NODE_VERSION)) {
    return semver.clean(version);
  } else {
    throw new Error(
      colors.red(`当前nodejs版本过低,请安装${LOWEST_NODE_VERSION}以上版本`)
    );
  }
}
