// Please run with:
// node --max-old-space-size=4096 add-ids-to-features.js

const fsPromises = require('fs/promises');
const fileName = './data-seeds/featured-images-info-object.json'

const images = require(fileName);

(async function() {
  let ids = Object.keys(images.data)
  ids = ids.map(e=>parseInt(e))
  images.ids = ids
  try {
    await fsPromises.writeFile(fileName, JSON.stringify(images))

    // success case, the file was saved
    console.log('DB saved!');
  } catch(err) {
    throw err;
  }
})()
