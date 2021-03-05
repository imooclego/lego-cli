const cp = require("child_process");
const path = require("path");

console.log(`主进程中的process:`, process.pid);
console.log(`主进程中的process:`, process.ppid);

// 传参方式：
// - 参数command，实际上可以混合command和args
// - 参数command支持传入模块路径
// 原理：生成shell壳，故效率较低
// 返回的child_process实例中没有ppid
// 进程自行退出
// 
/*
const exec = cp.exec(
  path.resolve(__dirname, "exec.js"),
  (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    // 回调是在主进程中执行的
    console.log("callback", process.pid);
  }
);
console.log("main:", exec.pid);
console.log("main:", exec.ppid); // 取不到ppid
*/

// 传参方式：
// - 参数command和args严格区分
// - 参数command支持传入模块路径
// 原理不同：不生成shell壳，故效率更高
// 返回的child_process实例中没有ppid
// 进程自行退出
/*
const execFile = cp.execFile(
  path.resolve(__dirname, "execFile.js"),
  [],
  (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    // 回调是在主进程中执行的
    console.log("callback:", process.pid);
  }
);
console.log("main:", execFile.pid);
console.log("main:", execFile.ppid); // 取不到ppid
*/

// 以上方法都是由spawn封装而成的
// 选项中没有encoding，默认的编码是Buffer
// 没有返回child_process实例，必须在主进程中监听新实例
// 事件（还没搞清楚）：close/disconnect/error/exit/message
// 进程自行退出
/*
const spawn = cp.spawn(path.resolve(__dirname, "spawn.js"), ["-a", "-b"], {});
spawn.stdout.on("data", function (chunk) {
  console.log(chunk.toString());
});
spawn.stderr.on("data", function (chunk) {
  console.log(chunk.toString());
});

console.log("main:", spawn.pid);
console.log("main:", spawn.ppid); // 取不到ppid
console.log("main:", spawn.spawnargs);
console.log("main:", spawn.spawnfile);
spawn.exitCode = 1;
spawn.signalCode = "ABC";
console.log("main:", spawn.signalCode);
*/

// for方法是实时的，有别于spawn方法以及衍生方法是非实时的
// 新进程不会自动退出，除非调用disconnect方法
// fork对象（主进程中）可以与新进程双向通信,send/on
// 天然支持模块，模块中无需指定脚本解释器！其他方法需要指定

const fork = cp.fork(path.resolve(__dirname, "fork.js"));
fork.on("message", (msg) => {
  console.log(msg);
  // 回调是在主进程中执行的
  console.log("event:", process.pid);
});
fork.send("from main.js: hi!");
console.log("main:", fork.pid);
console.log("main:", fork.ppid); // 取不到
