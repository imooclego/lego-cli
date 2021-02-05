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
const { getNpmInfo } = require("@imooc-lego/cli-utils-get-npm-info");
/* others */
const pkg = require("../package.json");
const { LOWEST_NODE_VERSION, DEF_CLI_HOME } = require("./const");
const { version, geteuid } = process;

/* 主流程 */
async function main(argv) {
  try {
    log.notice("输入的参数", "%s", chk_ipt_args());
    log.verbose("debug", "test");
    log.notice("cli版本号", "v%s", chk_pkg_ver());
    log.notice("node版本号检查", "v%s", chk_node_ver());
    log.notice("UID", "%s", chk_root());
    log.notice("用户主目录", "%s", chk_user_home());
    log.notice("全局包的检查", "%s", chk_env());
    const msg = await chk_global_pkg();
    if (msg) log.warn(msg[0], "%s", msg[1]);
  } catch (e) {
    log.error(e.message);
  }
}

/* 检查全局包
 * 1，获取当前版本号和模块名
 * 2，调用npmAPI，获取所有版本号
 * 3，提取所有版本号，比对那些版本号是大于当前版本号
 * 4，获取最新的版本号，提示用户更新到该版本
 */
async function chk_global_pkg() {
  const { version, name } = pkg;
  const data = await getNpmInfo({ name });
  let versions = Object.keys(data.versions).filter((item) =>
    semver.satisfies(item, `>${version}`)
  );
  const lastVersion = versions.length > 0 && versions.sort((a, b) => b - a)[0];
  if (lastVersion) return [`新版本（v${lastVersion}）已发布，请尽快更新`,`npm i -g ${name}`];
  return null;
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
