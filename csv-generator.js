// Create a CSV file from the wikimedia images metadata and google image search

const util = require('util');
const fs = require('fs');
const images = require('./images-with-metadata.json');
const readFileAsync = util.promisify(fs.readFile);

const CSV_FILE_NAME = 'images.csv';
const header = require('./csv/images-header.js');

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
            // Image Date
            csvLineObj[header.DATE_TIME] = toCSVStringFormat(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.DateTime.value)
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
              0;
            // Image Metadata
            csvLineObj[header.TYPE] = images.data[id].imageInfo["0"].imageinfo["0"].mime
            csvLineObj[header.SIZE] = images.data[id].imageInfo["0"].imageinfo["0"].size
            csvLineObj[header.HEIGHT] = images.data[id].imageInfo["0"].imageinfo["0"].height
            csvLineObj[header.WIDTH] = images.data[id].imageInfo["0"].imageinfo["0"].width
            // Featured?
            csvLineObj[header.ASSESSMENTS] = toCSVStringFormat(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Assessments.value)
            csvLineObj[header.CATEGORIES] = toCSVStringFormat(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Categories.value)
            csvLineObj[header.LICENSE] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.License))
            csvLineObj[header.LICENSEURL] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Licenseurl))
            csvLineObj[header.PERMISSION] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Permission))
            csvLineObj[header.USAGETERMS] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Usageterms))
            csvLineObj[header.RESTRICTIONS] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Restrictions))
            csvLineObj[header.ARTIST] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Artist))
            csvLineObj[header.CREDIT] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Credit))
            csvLineObj[header.ATTRIBUTION] = toCSVStringFormat(checkIfExist(images.data[id].imageInfo["0"].imageinfo["0"].extmetadata.Attribution))

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
