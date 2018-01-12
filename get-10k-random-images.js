// Retrive 10k images.

// Ask random media files namespace = 6
// namespace list https://en.wikipedia.org/wiki/Wikipedia:Namespace
// https://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=500

const fs = require('fs');
const fileName = 'random-images.json'

var https = require('https');
var url = require('url');

// Total number of random media
const numberMedias = 11000

function wikiWork(optionsL) {
  // var photoURL = 'http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg';
  // console.log('optionsL')
  // console.log(optionsL)
  let options = {
    hostname: 'commons.wikimedia.org',
    path: 'w/api.php',
    method: 'GET',
    search: ''
  };
  return new Promise((resolve, reject) => {
    console.time('label');
    const req = https.request(optionsL, (res) => {
      let resultado = ''
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resultado += chunk
        // console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
        console.timeEnd('label');
        resolve(resultado);
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    // write data to request body
    req.write('');
    req.end();
  });
}

async function a() {
  const baseUrl = 'https://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=500'
  var options = new url.URL(baseUrl)
  let randomImages = []
  let result = {}

  // console.log(options)
  options.searchParams.append('format', 'json')

  result = JSON.parse(await wikiWork(options))
  randomImages = [ ...randomImages, ...result.query.random ]
  // console.log( randomImages )

  for (let i in result.continue) {
    options.searchParams.append(i, result.continue[i])
  }

  // console.log('options')
  // console.log(options)

  result = JSON.parse(await wikiWork(options))
  // console.log( typeof result )
  randomImages = [ ...randomImages, ...result.query.random ]
  // console.log( randomImages )

  while (randomImages.length < numberMedias) {
    for (let i in result.continue) {
      options.searchParams.set(i, result.continue[i])
    }

    result = JSON.parse(await wikiWork(options))
    randomImages = [ ...randomImages, ...result.query.random ]
  }
  console.log( randomImages.length )
  console.log( randomImages )

  fs.writeFile(fileName, JSON.stringify({random : randomImages}), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('medias saved!');
  });
}

a()
