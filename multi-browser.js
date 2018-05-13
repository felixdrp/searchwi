// const cmd = require('cmd-promise')
//
// const commands = `node --max-old-space-size=4096 google_test0.js & BROWSER_CHROME_ID=$!`
//
// // cmd(commands).then(out => {
// //   console.log('out =', out)
// //   debugger
// // }).catch(err => {
// //   console.log('err =', err)
// // })
//
// const options = { returnProcess: true }
//
// cmd('node --max-old-space-size=4096 google_test0.js', options).then(childProcess => {
//   console.log('pid =', childProcess.pid)
//   childProcess.stdout.on('data', stdout => {
//     console.log('stdout =', stdout)
//   })
//   childProcess.stderr.on('data', stderr => {
//     console.log('stderr =', stderr)
//   })
//
//   setTimeout(() => {
//     debugger
//     console.log('kill ' + childProcess.pid)
//
//     childProcess.kill('SIGHUP')
//     childProcess.kill('SIGTERM')
//     childProcess.kill('SIGKILL')
//
//     cmd('kill ' + childProcess.pid)
//   }, 5e3 * 2)
//
//   // debugger
// }).catch(err => {
//   console.log('err =', err)
// })
const timer = require('timer-total')
const { spawn } = require('child_process');

function startBrowser(type = 0) {
  // const chrome = spawn('node', ['--max-old-space-size=4096', 'google_test0.js']);
  const chrome = spawn('node', ['--max-old-space-size=4096', `google_test${type}.js`]);

  chrome.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  chrome.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  chrome.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  setTimeout(() => {
    console.log('kill ' + chrome.pid)

    chrome.kill('SIGHUP')
    chrome.kill('SIGTERM')
    // chrome.kill('SIGKILL')
    // debugger

    // cmd('kill ' + chrome.pid)
  }, 9 * 60e3)
}

// Work a week
const t = timer({
  // delay: 100,
  interval: 20 * 60e3,
  callback: () => {
    startBrowser(0)
    // startBrowser(1)
  },
  duration: 7 * 24 * 60 * 60e3
})

const t2 = timer({
   delay: 10 * 60e3,
  interval: 20 * 60e3,
  callback: () => {
    // startBrowser(0)
    startBrowser(1)
  },
  duration: 7 * 24 * 60 * 60e3
})
