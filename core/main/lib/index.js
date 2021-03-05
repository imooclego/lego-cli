"use strict";
module.exports = main;

// build-in
const path = require("path");
// node_modules
const dotenv = require("dotenv");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const Commander = require("commander");
const figlet = require("figlet");
const boxen = require("boxen");

const log = require("@imooc-lego/cli-utils-log");
const exec = require("@imooc-lego/cli-core-exec");
const { getNpmInfo } = require("@imooc-lego/cli-utils-get-npm-info");

const pkg = require("../package.json");
const { LOWEST_NODE_VERSION, DEF_CLI_HOME } = require("./const");
const program = new Commander.Command();

/* 主流程 */
async function main(argv) {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error(e.message);
    if (process.env.LOG_LEVEL === "verbose") {
      console.log(e);
    }
  }
}

/* 启动阶段
 * 仅仅做检查，不做log输出
 */
async function prepare() {
  chk_pkg_ver(); // cli版本号
  chk_node_ver(); // node版本号检查
  chk_root(); // UID
  chk_user_home(); // 用户主目录
  chk_env(); // 全局包的检查
  await chk_global_pkg(); // 全局包版本检查。本地包就不需要提示更新吗？
}

/* logo图案
 * - figlet用于文字转图案
 * - colors用于着色
 * - boxen用于排版
 */
function renderLogo(logo, version) {
  const logoText = figlet.textSync(logo, {
    horizontalLayout: "full",
    verticalLayout: "full",
  });
  const colorText = [colors.green(logoText), colors.green(`v${version}`)].join(
    "\n"
  );
  const boxed = boxen(colorText, {
    align: "right",
    borderStyle: {
      topLeft: " ",
      topRight: " ",
      bottomLeft: " ",
      bottomRight: " ",
      horizontal: " ",
      vertical: " ",
    },
  });
  return boxed;
}

/* 注册命令 */
function registerCommand() {
  // 注册全局属性
  // 如何获取已注册全局属性：
  // - 在program实例中直接获取
  // - 通过program.opts()获取所有注册的全局属性
  program
    .name(Object.keys(pkg.bin)[0])
    .usage(`<command> [options]`)
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-h, --help", "帮助文档")
    .option(
      "-tp, --targetPath <dir>",
      "目标位置（具体业务要看具体命令）",
      null
    );
  // 注册命令
  // 如何获取已注册命令：
  // - program.commands
  program
    .command("init [projectName]")
    .option("-f, --force", "覆盖工程目录中的文件")
    .action(exec);
  // 监听全局参数
  program.on("option:debug", () => {
    const opts = program.opts();
    log.level = process.env.LOG_LEVEL = opts.debug ? "verbose" : "info";
    // TODO
  });
  program.on("option:targetPath", (value) => {
    process.env["LEGO_CLI_TARGET"] = value;
  });
  // 若不进行全局注册（使用默认的）则监听不到的
  program.on("option:help", () => {
    if (program.rawArgs.length === 3)
      console.log(renderLogo("LEGO", pkg.version));
  });
  // 监听所有命令
  program.on("command:*", (commands) => {
    const availableCommands = program.commands.map((cmd) => cmd._name);
    // 当输入未知命令时
    const unknowCmds = commands.filter((cmd) => {
      return !availableCommands.includes(cmd);
    });
    if (unknowCmds.length > 0) {
      log.warn("未知命令", unknowCmds.join(" "));
      log.notice("请使用已注册命令", availableCommands.join(" "));
    }
  });
  program.parse(process.argv);
  // 没有写任何参数时，打印出帮助
  // program.args 记录了所有输入的命令
  // 而process.argv则记录了所有输入，而且前两个是 [nodeExecFile,entryFile]
  if (program.args.length === 0) {
    program.outputHelp(); // 输出顶层帮助
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
  if (lastVersion)
    return [`新版本（v${lastVersion}）已发布，请尽快更新`, `npm i -g ${name}`];
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
  env["LEGO_CLI_HOME"] =
    path.resolve(userHome, env["LEGO_CLI_HOME"]) ??
    path.resolve(userHome, DEF_CLI_HOME);

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
  if (semver.gte(process.version, LOWEST_NODE_VERSION)) {
    return semver.clean(process.version);
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
  return process.geteuid();
}
