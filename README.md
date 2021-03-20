# lego-cli 工程

该工程用于容纳乐高产品的工具链项目的代码（command-line toolchain）
该工程的目录结构遵循 lerna 规范
分包都将发布到 npm 上去
分包遵循@imooc-lego/cli-<package-name>空间命名规范
其中，@imooc-lego/cli-core 是 npm-cli 类型的 npm-package，是整个工具链的入口文件

## 目录结构说明

.github/ // github 托管平台的配置
.vscode/ // vscode 本地配置
.editorconfig
.gitignore
lerna.josn
LICENSE
package.json
README.md

// 以下是 lerna-package 目录相关
npm-package-name 遵循的格式：`<npm-org-name>/<package-type >-<package-name>`

- core
  - main @imooc-lego/cli-core
- commands
  - main @imooc-lego/cli-commands
- models
  - main @imooc-lego/cli-models
- utils
  - main @imooc-lego/cli-utils
  - log @imooc-lego/cli-utils-log

## 全局变量

process.env.LEGO_CLI
  // 配置环境
  mode // 开发环境
  userHome // 用户目录
  cacheHome // 缓存目录
  // 全局属性kv
  globalOptions.target
  