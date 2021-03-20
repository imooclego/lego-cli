"use strict";

module.exports = { commanderActionArgsParse, types };
/* 判断数据类型 */
function types(v) {
  const typeStr = Object.prototype.toString.call(v);
  const types = typeStr
    .substring(1, typeStr.length - 1)
    .split(" ")[1]
    .toLowerCase();
  return types;
}
/*  解析commander-actions的回调参数 */
function commanderActionArgsParse(args) {
  const commandParams = Array.prototype.slice.call(args, 0, args.length - 2);
  const [commandOptions, commandObject] = Array.prototype.slice.call(
    args,
    args.length - 2
  );
  return { commandParams, commandOptions, commandObject };
}
