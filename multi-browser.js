// node --inspect-brk  --max-old-space-size=4096 multi-browser.js

const fsPromises = require('fs').promises;
const timer = require('timer-total')
const { spawn } = require('child_process');
const imagesDB = require('./images-db/images-db');

// Files to Control expired data.
// const fileNameExpiratedImages = './data-seeds/featured-images-expired.list';
// const fileName = './data-seeds/featured-images-info-object-expired-removed.json'

// const fileNameExpiratedImages = './data-seeds/quality-distilled-images-expired.list';
// const fileName = './data-seeds/quality-distilled-filtered-images-info-object-expired-removed.json'

const fileNameExpiratedImages = './data-seeds/valued-distilled-images-expired.list';
const fileName = './data-seeds/valued-distilled-filtered-images-info-object-expired-removed.json'


const images = require(fileName);
// Filter elements corrupted or lossed
let imDB = new imagesDB(images)
// imDB.save(fileName)
// async function removeExpired() {
//   for (let id of [
//     1097956,
//     1247252,
//     1612827,
//     1613085,
//     1613174,
//     1772173,
//     1805186,
//     2010656,
//     2044253,
//     2100001,
//     2106760,
//     2112596,
//     2167203,
//     2185092,
//     2208354,
//     2235828,
//     2237330,
//     2477482,
//     2477561,
//     2489024,
//     2595372,
//     2595513,
//     2794844,
//     2852685,
//     2854109,
//     2929515,
//     30318269,
//   ]) {
//     imDB.delete({key: id})
//   }
//   imDB.save(fileName)
// }
// removeExpired()

// let readFile = await fsPromises.readFile(filename, 'utf8')
async function saveExpiredImage(id) {
  try {
    await fsPromises.appendFile(fileNameExpiratedImages, `${id}\n`, 'utf8')
    console.log(`Image ID ${id} expired saved!`);
  } catch(err) {
    throw err;
  }
}

function startBrowser(type = 0) {
  let id = null
  // function to close the browser
  let kill = () => {
    console.log('kill ' + browserX.pid)

    browserX.kill('SIGHUP')
    browserX.kill('SIGTERM')
    // browserX.kill('SIGKILL')
    // debugger

    // cmd('kill ' + browserX.pid)
  }
  // Timer to close the browser in the future!
  let cancelKill = setTimeout(kill, 9 * 60e3)

  const errorURLNotAccessible = `Error: The URL doesn't refer to an image or the image is not publicly accessible`
  // const chrome = spawn('node', ['--max-old-space-size=4096', 'google_test0.js']);
  const browserX = spawn('node', ['--max-old-space-size=4096', `google_test${type}.js`]);

  browserX.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    if (data.includes('processing >>')) {
      id = parseInt(/\d+/.exec(data)[0]);
    }
  });

  browserX.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    if (data.toString().includes(errorURLNotAccessible) && id) {
      // debugger
      // Delete the id from db and save db
      imDB.delete({key: id});
      imDB.save(fileName)
        .then(()=>{
          // save expired id
          saveExpiredImage(id)
          // Clear browser timeout and end browser
          clearTimeout(cancelKill)
          kill()
          // Start a new cycle without the expired id.
          cancelAll()
          cancelAll = runMultipleBrowsers()
        })
    }
  });

  browserX.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function runMultipleBrowsers() {
  // Work a week
  const t1 = timer({
    // delay: 100,
    interval: 20 * 60e3,
    callback: () => {
      // startBrowser(0)
      startBrowser(1)
    },
    duration: 7 * 24 * 60 * 60e3
  })

  const t2 = timer({
     delay: 10 * 60e3,
    interval: 20 * 60e3,
    callback: () => {
      startBrowser(0)
      // startBrowser(1)
    },
    duration: 7 * 24 * 60 * 60e3
  })

  return () => [t1, t2].forEach((stopTimer) => stopTimer())
}

var cancelAll = runMultipleBrowsers()
