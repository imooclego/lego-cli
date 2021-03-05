"use strict";

module.exports = init;

function init(projectName, cmdOpts) {
  console.log({ projectName, cmdOpts, target: process.env["LEGO_CLI_TARGET"] });
}
