// Create a CSV file from the wikimedia images metadata and google image search

const util = require('util');
const fs = require('fs');
const images = require('./images-with-metadata.json');
const readFileAsync = util.promisify(fs.readFile);
const parseDomain = require('parse-domain');

const CSV_FILE_NAME = 'images-search-results.csv';
const header = require('./csv/images-google-search-header.js');

const toCSVStringFormat = (stg) => `"${stg.replace(/\"/g, '""')}"`;
const checkIfExist = (key) => {return key? key.value: ''};
console.time('all files');

(async function() {
  try {
    let filesInProgress = []
    let csv = [
      // CSV header
      header.CSV_HEADER.join(',')
    ]
    for (let i=0;i<2;i++) {
    // for (let i=0;i<images.ids.length;i++) {
      let id = images.ids[i][0]

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
          csvLineObj[header.UE_DOMAIN] = images.data[id].imageInfo["0"].imageinfo["0"].width
          csvLineObj[header.GENERAL_DOMAIN] = images.data[id].imageInfo["0"].imageinfo["0"].width

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
            console.log('ERROR:', err);
            console.log('ERROR on ID:', id);
            debugger
            fileData = false
          }
          fileNumber += 1
        } while (fileData)
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
