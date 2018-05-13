// Retrive 10k images. info.
// Execute with log:
// node get-10k-images-info.js |& tee metadata.log
var { getWikiMediaData } = require('./wikimedia-api');

const fs = require('fs');
// const fileName = './data-seeds/quality-destiled-filtered-images-info-object.json'
// const fileName = './data-seeds/valued-destiled-filtered-images-info-object.json'
const fileName = './data-seeds/qualityValued-destiled-filtered-images-info-object.json'

const mainSeed = require('./data-seeds/main-seed-filtered.json')
var images = [
  // ...mainSeed.qualityDestiled,
  // ...mainSeed.valuedDestiled,
  ...mainSeed.valuedQualityDestiled,
]

var media = {
  // data indexed by ids
  data: {},
  // nameToId: {},
  titleToId: {},
  ids: [],
  names: [],
  titles: []
}

// https://commons.wikimedia.org/w/api.php?action=query&prop=info&pageids=10002109&format=json

async function a() {
  var allQueries = []
  var counter = 0
  var parallelCounter = 0
  // var mlk = await getWikiMediaData(16817314)
  // console.log(mlk)
  for (let titleIndex in images) {
    const fileTitle = images[titleIndex]
    const filteredTitle = /File:[\s\S]*/.exec(fileTitle)[0]
    let query = getWikiMediaData({title: filteredTitle})

    // when query resolve add metadata to media
    query.then(
      (metadata) => {
        // debugger
        const key = metadata.imageInfo["0"].pageid
        const title = metadata.imageInfo["0"].title

        // const name = metadata.imageInfo["0"].imageinfo["0"].extmetadata.ObjectName.value
        // const title = media.data[key].title
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
