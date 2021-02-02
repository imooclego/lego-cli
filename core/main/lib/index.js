"use strict";

module.exports = main;
const semver = require("semver");
const colors = require("colors");
const log = require("@imooc-lego/cli-utils-log");
const pkg = require("../package.json");
const { LOWEST_NODE_VERSION } = require("./const");
const { version, geteuid } = process;

function main(argv) {
  try {
    log.notice("CLI_VERSION", "v%s", chk_pkg_ver());
    log.notice("NODE_VERSION", "v%s", chk_node_ver());
    log.notice("UID", "%s", chk_root());
  } catch (e) {
    log.error(e.message);
  }
}
/* 检查包版本 */
function chk_pkg_ver() {
  return pkg.version;
}
/* 检查node版本
 * 版本过低抛错给外层
 */
function chk_node_ver() {
  if (semver.gte(version, LOWEST_NODE_VERSION)) {
    return semver.clean(version);
  } else {
    throw new Error(
      colors.red(`当前nodejs版本过低,请安装${LOWEST_NODE_VERSION}以上版本`)
    );
  }
}
/* 检查当前用户的使用权限
 * 如果当前用户的使用权限是sudo则降级为该用户权限
 */
function chk_root() {
  require("root-check")();
  return geteuid();
}
