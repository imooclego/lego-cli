/* 命令动态行为的抽象 */

"use strict";
const path = require("path");
const utils = require("@imooc-lego/cli-utils");
const pkgDir = require("pkg-dir").sync;
const pathExists = require("path-exists").sync;
const npminstall = require("npminstall");
const formatPath = require("@imooc-lego/cli-utils-format-path");
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@imooc-lego/cli-utils-get-npm-info");

class Package {
  constructor(options) {
    if (utils.types(options) !== "object") {
      throw new Error("Package类的options数据类型必须为Object");
    }
    // 目标包路径
    this.targetPath = options.targetPath;
    // 安装包缓存路径
    this.storeDir = options.storeDir;
    // 缓存目录名的前缀
    // 安装包信息
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion || "latest";
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
    const orgnizationName = this.packageName.match(/^@[^\/]+/);
    this.cacheFilePathSuffix =
      orgnizationName === null ? this.packageName : orgnizationName[0];
  }
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.cacheFilePathSuffix}`
    );
  }
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.cacheFilePathSuffix}`
    );
  }
  // ?其实这个逻辑还是不严谨
  // 应该是先查询包的tag有没有latest，如果没有则取最新的version
  async prepare() {
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }
  /* package是否存在 */
  async exists() {
    // 判断是缓存目录模式，还是自定义目录模式
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    }
    return pathExists(this.targetPath);
  }
  /* 安装package */
  async install() {
    await this.prepare();
    await npminstall({
      debug: false,
      root: this.targetPath,
      storeDir: this.storeDir,
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
      registry: getDefaultRegistry(),
    }).catch((err) => {
      console.error(err);
    });
  }
  /* 更新package */
  async update() {
    // 获取最新npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    // 如果不存在，则直接安装最新版本
    // ？那你不应该把老版本号删除吗？
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion,
          },
        ],
      });
      this.packageVersion = latestPackageVersion;
    }
    return latestFilePath;
  }
  /* 获取入口文件的路径 */
  getRootFilePath() {
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
    function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录
      const dir = pkgDir(targetPath);
      if (dir) {
        // 2. 读取package.json
        const pkgFile = require(path.resolve(dir, "package.json"));
        // 3. 寻找main/lib
        if (pkgFile && pkgFile.main) {
          // 4. 路径的兼容(macOS/windows)
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
  }
}

module.exports = Package;
