"use strict";

module.exports = {
  getNpmInfo,
  getDefaultRegistry,
  getNpmVersions,
  getNpmLatestVersion,
};
/* pkg */
const axios = require("@imooc-lego/cli-config/axios");
const semver = require("semver");
const urlJoin = require("url-join");
/* other */
const { REGISTRY } = require("./const");

async function getNpmInfo(args) {
  const { name = null, registry = getDefaultRegistry() } = args;
  if (!name) return null;
  const url = urlJoin(registry, name);

  return axios
    .get(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return null;
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}
async function getNpmVersions(name, registry) {
  const data = await getNpmInfo({ name, registry });
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}
async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((next, cur) => {
      return semver.lt(next, cur) ? 1 : -1;
    })[0];
  }
  return null;
}

function getDefaultRegistry(isOrigin) {
  return isOrigin ? REGISTRY.NPM : REGISTRY.TAOBAO;
}
