const Axios = require("axios");

const axios = Axios.create({
  timeout: 2000,
  headers: { "X-Custom-Header": "foobar" },
  proxy: proxy(),
});
function proxy() {
  if (process.env.LEGO_CLI_MODE === "development") {
    return {
      host: "127.0.0.1",
      port: 3000,
    };
  }
  return false;
}

module.exports = axios;
