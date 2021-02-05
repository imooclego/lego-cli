"use strict";

module.exports = { getNpmInfo };
/* pkg */
const axios = require("axios");
const semver = require("semver");
const urlJoin = require("url-join");
/* other */
const { REGISTRY } = require("./const");

async function getNpmInfo(args) {
  const {
    name = null,
    isOrigin = false,
    registry = isOrigin ? REGISTRY.NPM : REGISTRY.TAOBAO,
  } = args;
  if (!name) return null;
  const url = urlJoin(registry, name);

  return axios
    .get(url)
    .then((response) => {
      if ((response.status === 200)) {
        return response.data;
      }
      return null;
    })
    .catch((e) => {
      return Promise.reject(err);
    });
}
