// Create a CSV file from the wikimedia images metadata and google image search

const util = require('util');
const fs = require('fs');
// const images = require('./images-with-metadata.json');
const readFileAsync = util.promisify(fs.readFile);
const parseDomain = require('parse-domain');

// const imagesMainSeed = require('./data-seeds/main-seed-filtered.json');

// const images = require('./data-seeds/featured-images-info-object-expired-removed.json');
const images = require('./data-seeds/valued-distilled-filtered-images-info-object-expired-removed.json');

// const imagesExpiredPath = './data-seeds/featured-images-expired.list';
const imagesExpiredPath = './data-seeds/valued-distilled-images-expired.list';

// const CSV_FILE_NAME = 'images-featured-distilled-search-results.csv';
// const CSV_FILE_NAME = 'images-valued-featured-distilled-search-results.csv';
// const CSV_FILE_NAME = 'images-quality-featured-distilled-search-results.csv';
// const CSV_FILE_NAME = 'images-valued-quality-featured-distilled-search-results.csv';
const CSV_FILE_NAME = 'images-valued-distilled-search-results.csv';
const header = require('./csv/images-google-search-header.js');
const {euTLD, generalTLD} = require('./csv/domains.js');


const toCSVStringFormat = (stg) => `"${stg.replace(/\"/g, '""')}"`;
const checkIfExist = (key) => {return key? key.value: ''};
console.time('all files');

(async function() {
  try {
    let imagesExpired = await readFileAsync(imagesExpiredPath, {encoding: 'utf8'})
    imagesExpired = imagesExpired.split('\n').map(e=>parseInt(e)).slice(0,-1)

    let filesInProgress = []
    let csv = [
      // CSV header
      header.CSV_HEADER.join(',')
    ]
    let ids

    // ### If imagesMainSeed
    // If Using data without distill then first distill data from imagesMainSeed
    // Uncomment to distill info from imagesMainSeed

    // // ids = imagesMainSeed.featureddistilled.reduce((res, e) => {
    // // ids = imagesMainSeed.valuedFeatureddistilled.reduce((res, e) => {
    // // ids = imagesMainSeed.qualityFeatureddistilled.reduce((res, e) => {
    // ids = imagesMainSeed.valuedQualityFeatured.reduce((res, e) => {
    //   let comp = decodeURIComponent(e).slice(6);
    //   for (let i in images.data) {
    //     if (comp.includes(images.data[i].pageimages["0"].pageimage)) {
    //   // console.log(i)
    //       res.push(parseInt(i))
    //       return res
    //     }
    //   }
    //   return res
    // }, [])

    // ### Else (imagesMainSeed not defined)
    ids = images.ids
    
    ids = ids.filter(e=>!imagesExpired.includes(e))

    for (let i=0;i<ids.length;i++) {
      let id = ids[i]

      const readGoogleSearchInfo = async () => {
        let fileData = ''
        let fileNumber = 1
        let rank = 0

        const proccessGoogleSearchInfo = (result, rank) => {
          let csvLine = []
          let csvLineObj = {}
          let domain = parseDomain(result.url)
          // Image id
          csvLineObj[header.ID] = id
          csvLineObj[header.RANK] = rank
          // URL
          csvLineObj[header.URL] = toCSVStringFormat(result.url)
          // Title
          csvLineObj[header.TITLE] = toCSVStringFormat(result.title)
          // Image globalusage
          csvLineObj[header.ABSTRACT] = toCSVStringFormat(result.abstract)
          // Image Metadata
          csvLineObj[header.URL_GREEN] = toCSVStringFormat(result.urlGreen)
          csvLineObj[header.TOP_LEVEL_DOMAIN] = domain.tld
          csvLineObj[header.SUB_DOMAIN] = domain.subdomain
          csvLineObj[header.DOMAIN] = domain.domain
          csvLineObj[header.UE_DOMAIN] = euTLD.indexOf(domain.tld) != -1
          csvLineObj[header.GENERAL_DOMAIN] = generalTLD.indexOf(domain.tld) != -1

          for (let title of header.CSV_HEADER) {
            csvLine.push(csvLineObj[title])
          }
          // csvLine.push(data)
          csv.push(csvLine.join(','))
        }

        // Proccess all the files by id
        do {
          try {
            fileData = await readFileAsync(`./data/${id}/${id}-${fileNumber}.json`, {encoding: 'utf8'})
            fileData = JSON.parse(fileData)
            for (let result of fileData.querySearch.results) {
              proccessGoogleSearchInfo(result, rank)
              rank += 1
            }
          } catch (err) {
            // console.log('ERROR:', err);
            // console.log('ERROR on ID:', id);
            // debugger
            console.log('Processed ID:', id);
            fileData = false
          }
          fileNumber += 1
        } while (fileData)
        return id
      }

      if (i % 100 == 0) {
        filesInProgress[i] = await readGoogleSearchInfo()
      } else {
        filesInProgress[i] = readGoogleSearchInfo()
      }
    }
    Promise.all(filesInProgress)
      .then((text) => {
        fs.writeFile(CSV_FILE_NAME, csv.join('\n'), (err) => {
          // throws an error, you could also catch it here
          if (err) throw err;
          // success case, the file was saved
          console.log('Write to File CSV');
          console.timeEnd('all files')
        });

        // console.log(csv);
      })
      .catch((err) => {
        console.log('ERROR Reason:', err);
        console.log('ERROR on writeFile:', id);
      });
  } catch(e) {
    console.error(e)
  } finally {
    // await driver.quit();
  }
})()
