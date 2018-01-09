// Module to search with an image. Using Bing

var https = require('https');
var { URL } = require('url');
const postData = '';

function searchWithImage(photoURL) {
    // var photoURL = 'http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg';

  const options = {
    hostname: 'www.bing.com',
    path: '/search?q=' + photoURL,
    method: 'GET'
  };
  return new Promise((resolve, reject) => {
    console.time('label');
    const req = https.request(options, (res) => {
      let resultado = ''
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resultado += chunk
        // console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        // console.log('No more data in response.');
        console.timeEnd('label');
        resolve(resultado);
      });
    // console.log('X-D',new URL(res.headers.location))
      // let optionsNew = new URL(res.headers.location);

      // let re = https.request(optionsNew, (res) => {
      //   let resultado = ''
      //   // console.log(`STATUS2: ${res.statusCode}`);
      //   console.log(`HEADERS2: ${JSON.stringify(res.headers)}`);
      //
      //   res.setEncoding('utf8');
      //   res.on('data', (chunk) => {
      //     resultado += chunk
      //   });
      //   res.on('end', () => {
      //     // console.log('No more data in response.');
      //     // console.log(`BODY2: ${resultado}`);
      //     resolve(resultado);
      //   });
      // });
      // re.write(postData);
      // re.end();
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
  });
}
module.exports.searchWithImage = searchWithImage;
