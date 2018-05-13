// Retrive 10k images.

// Ask random media files namespace = 6
// namespace list https://en.wikipedia.org/wiki/Wikipedia:Namespace
// https://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=500

const fs = require('fs');
// const fileName = 'valued-images-seed.json'
// const fileName = 'featured-images-seed.json'
const fileName = 'quality-images-seed.json'

var https = require('https');
var url = require('url');

// Total number of random media
const numberMedias = 11000

function wikiWork(optionsL) {
  // var photoURL = 'http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg';
  // console.log('optionsL')
  // console.log(optionsL)
  // let options = {
  //   hostname: 'commons.wikimedia.org',
  //   path: 'w/api.php',
  //   method: 'GET',
  //   search: ''
  // };
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

function getImagesAndNextUrl(document) {
  let nextUrl = ''
  let images = []

  // Get next 200 images page url
  let nextHref = document.match(/\<a.*next page\<\/.\>/g)
  if (nextHref) {
    // nextUrl = nextHref[0].match(/href\=\"(.*)\"\s/)[1]
    nextUrl = /(?:href=\"[\S\s]*){0,1}href=\"([\S\s]*)\"/g.exec(nextHref[0])[1]
    nextUrl = nextUrl.replace('&amp;', '&')
  } else {
    nextUrl = null
  }

  // Get the <ul> list of images.
  let ul = document.match(/<ul class="gallery mw-gallery-traditional"[\s\S\r\n]+<\/ul>/,'g')

  // ul[0].match(/<li[\s\S]*?\/li>/gm)
  let hrefs = ul[0].match(/href=\"[\s\S]*?\"\s/gm)
  // hrefs[0].match(/href=\"(.*)\"/)
  // Add all images urls to a Set
  hrefs = hrefs.reduce((r, e) => { r.add(e.match(/href=\"(.*)\"/)[1]); return r }, new Set())
  // Transform Set to Array
  hrefs = Array.from(hrefs)
  // Filter the array to take only the Files.
  images = hrefs.filter((e)=>e.includes('File:'))
  images = Object.assign([], images)
  // debugger

  return {
    nextUrl,
    images
  }
}

async function a() {
  const featuredImages = 'https://commons.wikimedia.org/wiki/Category:Featured_pictures_on_Wikimedia_Commons'
  const qualityImages = 'https://commons.wikimedia.org/w/index.php?title=Category:Quality_images&fileuntil=04+03+2015+Katharinenkirche+Frankfurt+Main+Germany.jpg%0A04+03+2015+Katharinenkirche+Frankfurt+Main+Germany.jpg#mw-category-media'
  const valuedImages = 'https://commons.wikimedia.org/wiki/Category:Valued_images_sorted_by_promotion_date'

  const baseUrl = 'https://commons.wikimedia.org'
  let options = new url.URL(qualityImages)
  let randomImages = []
  let result = {}

  let urls = [options.href]
  // console.log(options)
  // options.searchParams.append('format', 'json')

  do {
    // console.log(urls)
    result = getImagesAndNextUrl(await wikiWork(options))
    randomImages = [...randomImages, ...result.images]
    options = new url.URL(baseUrl + result.nextUrl || '')
    urls = [...urls, options.href]
    // debugger

  } while (result.nextUrl);
  // debugger
  //
  //
  // result = JSON.parse(await wikiWork(options))
  // randomImages = [ ...randomImages, ...result.query.random ]
  // // console.log( randomImages )
  //
  // for (let i in result.continue) {
  //   options.searchParams.append(i, result.continue[i])
  // }
  //
  // // console.log('options')
  // // console.log(options)
  //
  // result = JSON.parse(await wikiWork(options))
  // // console.log( typeof result )
  // randomImages = [ ...randomImages, ...result.query.random ]
  // // console.log( randomImages )
  //
  // while (randomImages.length < numberMedias) {
  //   for (let i in result.continue) {
  //     options.searchParams.set(i, result.continue[i])
  //   }
  //
  //   result = JSON.parse(await wikiWork(options))
  //   randomImages = [ ...randomImages, ...result.query.random ]
  // }
  // console.log( randomImages.length )
  // console.log( randomImages )

  fs.writeFile(fileName, JSON.stringify({random : randomImages}), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('medias saved!');
  });
}

a()
/*
https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&filefrom=2014+D%C3%A9caNation+-+800+m+13.jpg%0A2014+D%C3%A9caNation+-+800+m+13.jpg#mw-category-media
https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&amp;filefrom=2014+D%C3%A9caNation+-+800+m+13.jpg%0A2014+D%C3%A9caNation+-+800+m+13.jpg#mw-category-media
https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&filefrom=2014+D%C3%A9caNation+-+800+m+13.jpg%0A2014+D%C3%A9caNation+-+800+m+13.jpg#mw-category-media

https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&filefrom=3Ring+release+animation.gif%0A3Ring+release+animation.gif#mw-category-media
https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&fileuntil=2014+D%C3%A9caNation+-+800+m+13.jpg%0A2014+D%C3%A9caNation+-+800+m+13.jpg#mw-category-media%22%20title=%22Category:Featured%20pictures%20on%20Wikimedia%20Commons%22%3Eprevious%20page%3C/a%3E)%20(%3Ca%20href=%22/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&amp;filefrom=3Ring+release+animation.gif%0A3Ring+release+animation.gif#mw-category-media

[
  "https://commons.wikimedia.org/wiki/Category:Featured_pictures_on_Wikimedia_Commons",
  "https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&filefrom=2014+D%C3%A9caNation+-+800+m+13.jpg%0A2014+D%C3%A9caNation+-+800+m+13.jpg#mw-category-media",
  "https://commons.wikimedia.org/w/index.php?title=Category:Featured_pictures_on_Wikimedia_Commons&filefrom=3Ring+release+animation.gif%0A3Ring+release+animation.gif#mw-category-media"]

*/
