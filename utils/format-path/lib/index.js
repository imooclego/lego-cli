"use strict";

module.exports = formatPath;
const path = require("path");

/* 兼容不同操作系统的路径分隔符 */
function formatPath(p) {
  if (typeof p !== "string") return p;
  // windows上路径是反斜杠，统一格式化为斜杠
  if (path.sep === "\\") {
    return p.replace(/\\/g, "/");
  }
  return p;
}
