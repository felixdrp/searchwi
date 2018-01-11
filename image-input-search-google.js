// Module to search with an image. Using google

var https = require('https');
var { URL } = require('url');
const postData = '';


// https://images.google.com/searchbyimage?image_url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Ff%2Ffd%2FAngela_Merkel_%25282008%2529.jpg%2F1024px-Angela_Merkel_%25282008%2529.jpg&encoded_image=&image_content=&filename=&hl=en-GB

function searchWithImage(photoURL) {
    // var photoURL = 'http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg';

  const options = {
    hostname: 'www.google.com',
    path: '/search?q=' + photoURL,
    method: 'GET'
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        // console.log('No more data in response.');
      });
    // console.log('X-D',new URL(res.headers.location))
      let optionsNew = new URL(res.headers.location);

      let re = https.request(optionsNew, (res) => {
        let resultado = ''
        // console.log(`STATUS2: ${res.statusCode}`);
        console.log(`HEADERS2: ${JSON.stringify(res.headers)}`);

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          resultado += chunk
        });
        res.on('end', () => {
          // console.log('No more data in response.');
          // console.log(`BODY2: ${resultado}`);
          resolve(resultado);
        });
      });
      re.write(postData);
      re.end();
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
