"use strict";

module.exports = main;
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;

const log = require("@imooc-lego/cli-utils-log");
const pkg = require("../package.json");
const { LOWEST_NODE_VERSION } = require("./const");
const { version, geteuid } = process;

function main(argv) {
  try {
    log.notice("inputargs", "%s", chk_ipt_args());
    log.notice("CLI_VERSION", "v%s", chk_pkg_ver());
    log.notice("NODE_VERSION", "v%s", chk_node_ver());
    log.notice("UID", "%s", chk_root());
    log.notice("userhome", "%s", chk_user_home());
    log.verbose("debug", "test");
  } catch (e) {
    log.error(e.message);
  }
}

/* 检查入参
 * 若存在debug参数，则修改process.env.LOG_LEVEL标记为verbose
 */
function chk_ipt_args() {
  const minimist = require("minimist");
  const args = minimist(process.argv.slice(2));
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  }
  log.level = process.env.LOG_LEVEL;
  return args;
}

/* 检查用户主目录
 * 若用户主目录不存在则抛错给外层
 */
function chk_user_home() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error("当前登录用户的主目录不存在");
  }
  return userHome;
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
