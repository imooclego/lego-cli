#!/usr/bin/env node
const colors = require("colors/safe");
const dotenv = require("dotenv");
const path = require("path");
const importLocal = require("import-local");
const pathExists = require("path-exists").sync;
const semver = require("semver");
const userHome = require("user-home");
const { DEFAULT } = require("@imooc-lego/cli-config");
const pkg = require("../package.json");

function main() {
  chk_pkg_ver(); // cli版本号
  chk_node_ver(); // node版本号检查
  chk_root(); // UID
  chk_user_home(); // 用户主目录
  chk_env(); // 环境变量
  runEntry(); // 运行入口
}

try {
  main();
} catch (e) {
  log.error(e.message);
  if (process.env.LOG_LEVEL === "verbose") {
    console.log(e);
  }
}

function runEntry() {
  // 优先调用本地入口
  if (importLocal(__filename)) {
    console.log("cli", "正在使用脚手架的本地版本");
  } else {
    require("../lib")(process.argv.slice(2));
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
  create_def_cfg();
}
function create_def_cfg() {
  const env = process.env;
  env["USER_HOME"] = userHome;
  env["LEGO_CLI_HOME"] =
    path.resolve(userHome, env["LEGO_CLI_HOME"]) ??
    path.resolve(userHome, DEFAULT.DEF_CLI_HOME);

  return {
    USER_HOME: env["USER_HOME"],
    LEGO_CLI_HOME: env["LEGO_CLI_HOME"],
  };
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
  if (semver.gte(process.version, DEFAULT.LOWEST_NODE_VERSION)) {
    return semver.clean(process.version);
  } else {
    throw new Error(
      colors.red(
        `当前nodejs版本过低,请安装${DEFAULT.LOWEST_NODE_VERSION}以上版本`
      )
    );
  }
}
/* 检查当前用户的使用权限
 * 如果当前用户的使用权限是sudo则降级为该用户权限
 */
function chk_root() {
  require("root-check")();
  return process.geteuid();
}
