// Module to access wikimedia api.

// https://commons.wikimedia.org/w/api.php?action=query&titles=File:Angela%20Merkel%20(2008).jpg&prop=globalusage|extlinks|imageinfo|revisions|pageimages&gulimit=500&ellimit=500&iiprop=url|size|mime|metadata|extmetadata|comment&rvprop=content&format=json
// &iistart=2009-11-29T17:31:14Z&continue=||globalusage|extlinks

// &prop=extlinks|revisions&ellimit=500&rvprop=content


var https = require('https');
var { URL } = require('url');

const postData = '';
const baseUrl = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
var optionsBasic = new URL(baseUrl)

async function getWikiMediaData(id) {
  const url = `${baseUrl}&pageids=${id}&`
  // Select the props from wikimedia api query
  const imageInfo = requestWikiData(new URL(
    `${url}prop=imageinfo&iiprop=url|size|mime|metadata|extmetadata|comment`
  ))
  const globalusage = requestWikiData(new URL(
    `${url}prop=globalusage&gulimit=500`
  ))
  const extlinks = requestWikiData(new URL(
    `${url}prop=extlinks&ellimit=500`
  ))
  const revisions = requestWikiData(new URL(
    `${url}prop=revisions&rvprop=content`
  ))
  const pageimages = requestWikiData(new URL(
    `${url}prop=pageimages`
  ))
  return {
    imageInfo: await imageInfo,
    globalusage: await globalusage,
    extlinks: await extlinks,
    revisions: await revisions,
    pageimages: await pageimages
  }
}

async function requestWikiData(options) {
  let localOptions = options
  // console.log(options)
  let result = {}
  let wikiData = []
  let lastContinue = ''

  do {
    try {
      result = await requestCall(localOptions)
      // Check start by {
      if (/^\{/.test(result)) {
        result = JSON.parse(result)
      } else {
        result = {
          error: 'Check result. It is not a json file.',
          options: localOptions,
          resultQuery: result
        }
        wikiData = [
          ...wikiData,
          ...result
        ]
        break
      }
    } catch(e) {
      console.error(localOptions)
      console.error(result)
      console.error(e)
    }
    // Check result != last result
    if (
      JSON.stringify(wikiData[wikiData.length-1]) ==
      JSON.stringify(
        result.query.pages[Object.keys(result.query.pages)[0]]
      )
    ) {
      // debugger
      break
    }
    // Proccess result
    // debugger
    wikiData = [
      ...wikiData,
      result.query.pages[Object.keys(result.query.pages)[0]]
    ]
    // console.log( result )
    // debugger
    if (result.hasOwnProperty('continue')) {
      if (localOptions.searchParams.has('continue')) {
        // Remove unlimited continue fail
        if (lastContinue == JSON.stringify(result.continue)) {
          break
        }
        for (let i in result.continue) {
          options.searchParams.set(i, result.continue[i])
        }
      } else {
        for (let i in result.continue) {
          options.searchParams.append(i, result.continue[i])
        }
      }
      lastContinue = JSON.stringify(result.continue)
    }
  } while (result.hasOwnProperty('continue'))
  // console.log('options')
  // console.log(options)
  return wikiData
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
        resolve(resultado);
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
module.exports.getWikiMediaData = getWikiMediaData;
