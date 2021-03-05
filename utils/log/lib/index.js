"use strict";

const npmlog = require("npmlog");
const { LOG_LEVEL } = process.env;

/* 接受参数 */
npmlog.level = LOG_LEVEL || "info";
npmlog.heading = ":lego:";
npmlog.headingStyle = { fg: "blue", bg: "cyan" };

// npmlog.addLevel("success", 2000, { fg: "yellow", bold: true });
// console.log(process.env.LOG_LEVEL);

module.exports = npmlog;
