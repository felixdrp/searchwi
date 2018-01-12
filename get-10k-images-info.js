// Retrive 10k images. info.
var { getWikiMediaData } = require('./getWikiMediaData');

const fs = require('fs');
const fileName = 'media-object.json'

var images = require('./random-images.json')
var media = {
  // data indexed by ids
  data: {},
  ids: [],
  names: []
}

// Total number of random media
const numberMedias = 11000

// Data conditioning
if (!images.ids) {
  // Create media id index array at media.ids
  // Populate media.data with the info linked by ids. Ex media.data[id].data
  for (let key of images.random) {
    media.data[key.id] = key
    media.ids.push(key.id)
    // add the name with the wikimedia data.
    // media.names.push(key.id)
    if (media.ids.length > 4) {
      break
    }
  }
  media.ids.sort()
  media.names.sort()
}

// Check if it is any id repeated.
const repeatedIds = media.ids.reduce((s, v, i) => {
  if (i < media.ids.length - 1) {
    if (v === media.ids[i+1]) {
      return s + 1
    }
  }
  return s
}, 0)
console.log('Number of Repeated ids: ', repeatedIds)

console.log(getWikiMediaData(media.ids[0]))
// https://commons.wikimedia.org/w/api.php?action=query&prop=info&pageids=10002109&format=json

async function a() {


  fs.writeFile(fileName, JSON.stringify({random : randomImages}), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('medias saved!');
  });
}

// a()
