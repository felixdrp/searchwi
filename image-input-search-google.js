// Module to search with an image. Using google

var https = require('https');
var { URL } = require('url');

const postData = '';

// https://www.google.co.uk/searchbyimage?image_url=https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Angela_Merkel_%282008%29.jpg/799px-Angela_Merkel_%282008%29.jpg&btnG=Search+by+image&encoded_image=&image_content=&filename=&hl=en-GB

async function searchWithImage(photoURL) {
  const options = {
    hostname: 'www.google.co.uk',
    path: '/searchbyimage?image_url=' + photoURL +
      '&btnG=Search+by+image&encoded_image=&image_content=&filename=&hl=en-GB',
    method: 'GET',
    headers: {
      'Cookie': 'SID=YQUmQs74pARdoFaU73GjNdp2fuL0xnfKRaYPwLhUKctYC6e9vwknA3X0ivMTn7THG5R-9w.; HSID=AkEN-mQnYscfypLJl; SSID=AT1m7_HlaZfihzmCL; APISID=CoWCMLCyh5r1lT5T/ASNieHnK5C7T6XB_M; SAPISID=EUHwY55MSjDg9qCZ/APMuat10ij9zGt_4-; __gads=ID=80a24791045f25e9:T=1494125356:S=ALNI_MZG5h_fTvrH7mWs9BUHFXpfITNWiA; NID=121=rJu7V1tnzFGp2zk8TkFO9zONcrNYKtxNfbr03cihNwBMCy5at9L1q1x7egLII9MGLENuxzj5Mwg7eaT1G68htnp1kCmIBvYtPtIpPGbRJ9QKmO6E-8RiHev2NH4s2cYu9utNsYfAvh2Whk23l82PRZ4hQZ5Qe9l0Q9MB8pHH4-HE-Y79GMc8nwHA7Kau7-EALFHY0RIUMzDuejlsWc5uYIAS3nv3DQuWKKkehg-_gQrSfvibVrK70g; OGPC=873035776-30:5061821-10:; 1P_JAR=2018-1-18-16',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0'
    }
  };
  let result = await requestCall(options)
  let urlRed = new URL(result.res.headers.location)
  let optionsNew = {
    hostname: 'www.google.co.uk',
    path: '/search' + urlRed.search,
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding':	'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.5',
      Connection: 'keep-alive',
      Cookie: 'SID=YQUmQs74pARdoFaU73GjNdp2fuL0xnfKRaYPwLhUKctYC6e9vwknA3X0ivMTn7THG5R-9w.; HSID=AkEN-mQnYscfypLJl; SSID=AT1m7_HlaZfihzmCL; APISID=CoWCMLCyh5r1lT5T/ASNieHnK5C7T6XB_M; SAPISID=EUHwY55MSjDg9qCZ/APMuat10ij9zGt_4-; __gads=ID=80a24791045f25e9:T=1494125356:S=ALNI_MZG5h_fTvrH7mWs9BUHFXpfITNWiA; NID=121=butQLp7T8CCYOH4jEV-z0ZroOE00f-mlZ6WbaazHH7h6f-FEy7ICQkdnkhrnK7UakmtZmdJ2DQkqdbagojjvElfpOebe2ZaLmfZ7zhgyXrilPfugsaXopwqNpJKp-eYSzMk7Y1zzUxtq_qD7xgs6UgUEShL0RPR9SpD6OFwty0dePuWGrFmdLTW8sIUhFtr6eOslx6v4DmRDa30S78tY1VYPmJtXsZ3u4avMH3lyjXyWAifCu5Z2Ew; OGPC=873035776-30:5061821-10:; 1P_JAR=2018-01-18-17',
      Host: 'www.google.co.uk',
      Referer: 'https://www.google.co.uk/',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0'
    }
  }
  let result2 = await requestCall(optionsNew)
  debugger
  return requestCall(new URL(result2.res.headers.location))

  // setTimeout(async function() {
  //   result2 = await requestCall(optionsNew)
  //   debugger
  // }, 1000)
}

function requestCall(options) {
  return new Promise((resolve, reject) => {
    // console.time('label');
    const req = https.request(options, (res) => {
      let resultado = ''
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resultado += chunk
        // console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        // console.log('No more data in response.');
        // console.timeEnd('label');
        resolve({resultado, res});
      });
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
