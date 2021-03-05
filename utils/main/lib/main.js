"use strict";

module.exports = { types };

function types(v) {
  const typeStr = Object.prototype.toString.call(v);
  const types = typeStr
    .substring(1, typeStr.length - 1)
    .split(" ")[1]
    .toLowerCase();
  return types;
}
