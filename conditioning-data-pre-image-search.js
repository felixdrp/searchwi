const fs = require('fs');
const fileName = 'images-with-metadata.json'

var media = require('./media-object.json')
var media2 = {
  // data indexed by ids
  data: {},
  titleToId: {},
  ids: [],
  titles: []
}

var count = 0
var filtered = []
media.ids.forEach((id) => {
  let mime = media.data[id].imageInfo[0].imageinfo[0].mime
  // Remove no images, svg and tiff
  if (/^image/.test(mime) && mime != 'image/svg+xml' && mime != 'image/tiff') {
    filtered.push(id)
    count++
  }
  console.log(media.data[id].imageInfo[0].imageinfo[0].mime)
})
console.log(count)
// Take 10000 random images from filtered images.
// In the firt case filtered was "10172" files long.
var mil = []
do {
  mil.push(
    filtered.splice(Math.floor(Math.random(filtered.length)), 1)
  )
} while (mil.length < 10000 )
console.log(mil)
media2.ids = mil
media2.ids.forEach((id) => {
  let title = media.data[id].title
  media2.data[id] = media.data[id]
  media2.titles.push(title)
  media2.titleToId[title] = id
})

fs.writeFile(fileName, JSON.stringify(media2), (err) => {
  // throws an error, you could also catch it here
  if (err) throw err;
  // success case, the file was saved
  console.log('10K images with metadata saved!');
});
// debugger
