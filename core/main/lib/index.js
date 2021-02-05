"use strict";

module.exports = main;
/* packages */
const path = require("path");
const dotenv = require("dotenv");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const log = require("@imooc-lego/cli-utils-log");
/* others */
const pkg = require("../package.json");
const { LOWEST_NODE_VERSION, DEF_CLI_HOME } = require("./const");
const { env } = require("process");
const { version, geteuid } = process;

function main(argv) {
  try {
    log.notice("输入的参数", "%s", chk_ipt_args());
    log.verbose("debug", "test");
    log.notice("cli版本号", "v%s", chk_pkg_ver());
    log.notice("node版本号检查", "v%s", chk_node_ver());
    log.notice("UID", "%s", chk_root());
    log.notice("用户主目录", "%s", chk_user_home());
    log.notice("环境变量检查", "%s", chk_env());
  } catch (e) {
    log.error(e.message);
  }
}

/* 检查环境
 * 从用户主目录下加载.env文件（环境配置文件）
 * 从常量中查询kv（与.env下的kv相同）
 * 若环境配置中存在该key,返回value
 * 若环境配置中不存在该key,返回默认v
 *  - process.env中写入kv
 */
function chk_env() {
  const envPath = path.resolve(userHome, ".env");
  /* 加载全局的环境变量配置文件（～/.env）
   * dotenv会给全局环境变量赋值：process.env[key] = value
   */
  if (pathExists(envPath)) {
    dotenv.config({ path: envPath }).parsed;
  }
  /* 确保有值
   * 若没有指定的kv,则使用默认值
   */
  return create_def_cfg();
}
function create_def_cfg() {
  const env = process.env;
  env["USER_HOME"] = userHome;
  env["LEGO_CLI_HOME"] = env["LEGO_CLI_HOME"] ?? DEF_CLI_HOME;

  return {
    USER_HOME: env["USER_HOME"],
    LEGO_CLI_HOME: env["LEGO_CLI_HOME"],
  };
}

/* 检查入参
 * 若存在debug参数，则修改process.env.LOG_LEVEL标记为verbose
 */
function chk_ipt_args() {
  const minimist = require("minimist");
  const args = minimist(process.argv.slice(2));
  if (args.debug) {
    log.level = process.env.LOG_LEVEL = "verbose";
  }
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
