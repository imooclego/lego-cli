#!/usr/bin/env node

const commands = require("@imooc-lego/cli-commands");
const models = require("@imooc-lego/cli-models");
const utils = require("@imooc-lego/cli-utils");

console.log("=== entered core!===");
console.log(commands());
console.log(models());
console.log(utils());
