// Create a CSV file from the wikimedia images metadata and google image search

const util = require('util');
const fs = require('fs');
const images = require('./images-with-metadata.json');
const readFileAsync = util.promisify(fs.readFile);

const CSV_FILE_NAME = 'images.csv';
const header = require('./csv/images-header.js');

const toCSVStringFormat = (stg) => `"${stg.replace(/\"/g, '""')}"`;

console.time('all files');

(async function() {
  try {
    let filesInProgress = []
    let csv = [
      // CSV header
      header.CSV_HEADER.join(',')
    ]
    // for (let i=0;i<2;i++) {
    for (let i=0;i<images.ids.length;i++) {
      let id = images.ids[i][0]

      const readGoogleSearchInfo = () => {
        return readFileAsync(`./data/${id}/${id}-${1}.json`, {encoding: 'utf8'})
          .then((text) => {
            let data = JSON.parse(text)
            let csvLine = []
            let csvLineObj = {}
            // Image id
            csvLineObj[header.ID] = id
            // Image Title
            csvLineObj[header.TITLE] = toCSVStringFormat(images.data[id].title.slice(5))
            // Image URL
            csvLineObj[header.URL] = toCSVStringFormat(
              images.data[id].imageInfo["0"].imageinfo["0"].descriptionurl
            )
            // Image globalusage
            csvLineObj[header.METADATA_GLOBAL_USAGE_COUNT] = images.data[id].globalusage["0"].globalusage.length
            // google_image_search_hit_count
            //   removed 2 firsts searchs. No valids.
            csvLineObj[header.GOOGLE_IMAGE_SEARCH_HIT_COUNT] = data.resultStat && data.resultStat.numResults >= 2?
              data.resultStat.numResults - 2:
              0

            for (let title of header.CSV_HEADER) {
              csvLine.push(csvLineObj[title])
            }
            // csvLine.push(data)
            csv.push(csvLine.join(','))

            // let data = JSON.stringify(text)
            console.log('ID:', id);
            // console.log('CONTENT:', data);
            return { [id]: true }
          })
          .catch((err) => {
            console.log('ERROR:', err);
            console.log('ERROR on ID:', id);
          });
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
