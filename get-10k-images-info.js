// Retrive 10k images. info.
// Execute with log:
// node get-10k-images-info.js |& tee metadata.log
var { getWikiMediaData } = require('./wikimedia-api');

const fs = require('fs');
const fileName = 'media-object.json'

var images = require('./random-images.json')
var media = {
  // data indexed by ids
  data: {},
  // nameToId: {},
  titleToId: {},
  ids: [],
  names: [],
  titles: []
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
    // :-) Check limit
    // if (media.ids.length > 1) {
    //   break
    // }
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

// https://commons.wikimedia.org/w/api.php?action=query&prop=info&pageids=10002109&format=json

async function a() {
  var allQueries = []
  var counter = 0
  var parallelCounter = 0
  // var mlk = await getWikiMediaData(16817314)
  // console.log(mlk)
  for (let key in media.data) {
    let query = getWikiMediaData(key)

    // when query resolve add metadata to media
    query.then(
      (metadata) => {
        // const name = metadata.imageInfo["0"].imageinfo["0"].extmetadata.ObjectName.value
        const title = media.data[key].title
        // Add metadata to media (data, ids, names, nameToId)
        media.data[key] = { ...media.data[key], ...metadata }
        // media.names.push(name)
        // media.nameToId[name] = key
        media.titles.push(title)
        media.titleToId[title] = key
        counter += 1
        console.log(`${counter} > id: ${key} > title: ${title}`)
      }
    )
    // await each 5 queries to pause the download
    if (parallelCounter % 5 === 0) {
      allQueries.push(await query)
    } else {
      allQueries.push(query)
    }
    parallelCounter += 1
  }

  console.time('mlk')
  Promise.all(allQueries).then((value) => {
    // console.log(media);
    // console.log(value);
    console.timeEnd('mlk')
    fs.writeFile(fileName, JSON.stringify(media), (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
      // success case, the file was saved
      console.log('medias with metadata saved!');
    });
    // debugger
  });
}

a()
