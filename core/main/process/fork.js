process.on("message", (msg) => {
  console.log(msg);
  process.disconnect();
});

process.send("from fork.js:" + process.pid + " " + process.ppid);
