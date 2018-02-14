const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const fs = require('fs');
const images = require('./images-with-metadata.json');

// var { getWikiMediaData } = require('./wikimedia-api');
// // Function to restore the metadata of an id
// (async function() {
//   // Error metadata changed
//   // ids
//   // ========
//   // 16351320
//   // 3658179
//
//   // Error deleted!! "missing" image from wikimedia
//   // id removed from the DB
//   // 34326222
//   // 49274179
//   // 55111196
//   // 60033899
//   // 60444039
//   // 60753872, 61452099, 64912293, 65020961, 65020961, 65173698
//
//   // Added
//   // id 65110016, 43713031, 58276382, 15720487, 15018613, 45765842, 46551356, 15378706
//   // 57565421, 38364158
//
//   // added, edited
//   let key = 38364158
//   // removed
//   let idWillDeleted = false
//
//   let metadata = await getWikiMediaData(key)
//   const title = metadata.imageInfo["0"].title
//   debugger
//
//   // Delete completely an image
//   function deleteImageFromDB(idToDelete) {
//     images.ids.splice(
//       images.ids.findIndex((id) => id == idToDelete),
//       1
//     )
//     images.titles.splice(
//       images.titles.findIndex((oldTitle) => oldTitle == images.data[idToDelete].title),
//       1
//     )
//     delete images.titleToId[images.data[idToDelete].title]
//     delete images.data[idToDelete]
//     // Add the new Id to the ids array
//     images.ids.push([key])
//   }
//   if (idWillDeleted) {
//     deleteImageFromDB(idWillDeleted)
//   } else {
//     // // Delete old metadata
//     images.titles.splice(
//       images.titles.findIndex((oldTitle) => oldTitle == images.data[key].title),
//       1
//     )
//     delete images.titleToId[images.data[key].title]
//   }
//
//   // Add new metadata
//   images.data[key] = { ...images.data[key], ...metadata }
//   images.data[key].title = title
//   images.titles.push(title)
//   images.titleToId[title] = key
//
//   const fileName = 'images-with-metadata.json'
//   debugger
//   fs.writeFile(fileName, JSON.stringify(images), (err) => {
//     // throws an error, you could also catch it here
//     if (err) throw err;
//     // success case, the file was saved
//     console.log('10K images with metadata saved!');
//   });
// })()


require('geckodriver');
const {Builder, By, Key, until} = require('selenium-webdriver');

// Get url of the 1024px thumbnail image of an image id.
const urlSearch = (id, size) => {
  let thumb = images.data[id].pageimages["0"].thumbnail.source
  if (size) {
    thumb = thumb.replace(/\d+px/, size + 'px')
  } else {
    // thumb = thumb.replace(/\d+px/, '1024px')
    // thumb = thumb.replace(/\d+px/, '768px')
    // thumb = thumb.replace(/\d+px/, '640px')
    // thumb = thumb.replace(/\d+px/, '512px')
    thumb = thumb.replace(/\d+px/, '256px')
  }
  thumb = encodeURIComponent(thumb)
  thumb = encodeURIComponent(thumb)
  return `https://www.google.co.uk/searchbyimage?image_url=${thumb}&btnG=Search+by+image&encoded_image=&image_content=&filename=&hl=en-GB`
}
// Randomiza Aleatoriza el tiempo de navegacion para saltar defensas anti bots.
const randomOMaticVsBot = () => {
  return setTimeoutPromise(2e3 + Math.floor(Math.random()*2e3), 'next!')
}

const awaitingUpload = () => {
  return setTimeoutPromise(500, 'uploading image!')
}

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  // Load a page with 3 tries in case of image too big.
  async function loadSpecial(url, id) {
    const imageTooBigOrNetworkSlow = () => driver.executeAsyncScript(function () {
      var callback = arguments[arguments.length - 1];
      // Check if image to big
      var divMain = document.querySelector('#main');
      let imageTooBigOrNetworkSlow = (/The image is too big or the network connection is too slow to download it/).test(divMain.textContent)
      callback(imageTooBigOrNetworkSlow);
    })
    let maxTries = 3
    let i = 0
    do {
      //Humanize the access to google
      await randomOMaticVsBot()
      if (i >= 1) {
        await setTimeoutPromise(5000, 'Await some time to rest the network.')
        // try with 128 and 64 px
        await driver.get(urlSearch(id, 64*(3-i)));
      } else {
        await driver.get(url);
      }
      await awaitingUpload()

      i += 1
    } while(await imageTooBigOrNetworkSlow() &&  i < maxTries)
  }

  const getFirstSearchResults = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    try {
      var a = document.querySelector('#rso');
      // if class rso is used
      var rso = document.querySelectorAll('.srg')
      var g = document.querySelectorAll('#rso>div:last-child .g')
      var elementOverLastChildren = a.children[a.childElementCount - 2];
      var elements = [];
      if (
        a.childElementCount == 3 &&
        a.children[0].className == 'normal-header' &&
        a.children[1].className == '_NId' &&
        a.children[1].className == a.children[2].className
      ) {
        // do nothing
      } else if (a.childElementCount > 2) {
        for (let i of g) {
          let url, urlmatch, urlGreen, abstract
          let innerChildrenCount = i.children[0].children[0].children[1].childElementCount

          // Check it is a hyperlink <a> with href
          for (let h of i.children[0].children[0].children[0].children) {
            if (h.tagName == 'A') {
              url = h.href
              break
            }
          }
          urlmatch = url.match(/^https:\/\/www.google.*(&url=)(.*)(?:\&)/)
          if (urlmatch >= 2) {
            url = decodeURIComponent(url[2])
          }
          // Check if search line has image.
          if (i.children[0].children[0].children[1].childElementCount > 1) {
            urlGreen = i.children[0].children[0].children[1].children[1].children[0]?
              i.children[0].children[0].children[1].children[1].children[0].children[0].innerText:
              '',
            abstract = i.children[0].children[0].children[1].children[1].children[1]?
              i.children[0].children[0].children[1].children[1].children[1].innerText:
              ''
          } else {
            urlGreen = i.children[0].children[0].children[1].children[0].children[0]?
              i.children[0].children[0].children[1].children[0].children[0].innerText:
              ''
            abstract = i.children[0].children[0].children[1].children[0].children[1]?
              i.children[0].children[0].children[1].children[0].children[1].innerText:
              ''
          }

          elements.push({
            title: i.children[0].children[0].children[0].innerText,
            url: url,
            urlGreen: urlGreen,
            abstract: abstract
          })
        }
      }
    } catch(e) {
      console.error(e, 'getFirstSearchResults')
    }

    callback({
      searchRaw: a.innerHTML,
      results: elements
    });
  })

  const getSearchResults = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    try {
      var a = document.querySelector('#rso');
      var g = document.querySelectorAll('#rso>div:last-child .g')
      var elementOverLastChildren = a.children[a.childElementCount - 2];
      var elements = [];

      if (a.childElementCount == 1 || a.childElementCount > 2) {
        for (let n of g) {
          let url, urlmatch, urlGreen, abstract
          // Check it is a hyperlink <a> with href
          for (let h of n.children[0].children[0].children[0].children) {
            if (h.tagName == 'A') {
              url = h.href
              break
            }
          }
          urlmatch = url.match(/^https:\/\/www.google.*(&url=)(.*)(?:\&)/)
          if (urlmatch >= 2) {
            url = decodeURIComponent(url[2])
          }
          // Check if search line has image.
          if (n.children[0].children[0].children[1].childElementCount > 1) {
            urlGreen = n.children[0].children[0].children[1].children[1].children[0]?
              n.children[0].children[0].children[1].children[1].children[0].children[0].innerText:
              '',
            abstract = n.children[0].children[0].children[1].children[1].children[1]?
              n.children[0].children[0].children[1].children[1].children[1].innerText:
              ''
          } else {
            urlGreen = n.children[0].children[0].children[1].children[0].children[0]?
              n.children[0].children[0].children[1].children[0].children[0].innerText:
              ''
            abstract = n.children[0].children[0].children[1].children[0].children[1]?
              n.children[0].children[0].children[1].children[0].children[1].innerText:
              ''
          }

          elements.push({
            title: n.children[0].children[0].children[0].innerText,
            url: url,
            urlGreen: urlGreen,
            abstract: abstract
          })
        }
      }
    } catch(e) {
      console.error(e, 'getSearchResults')
    }

    callback({
      searchRaw: a.innerHTML,
      results: elements
    });
  })

  const getNextPage = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    var nextPage = document.querySelector('#pnnext');
    if (nextPage) {
      // return url next page.
      callback(nextPage.href);
    } else {
      // return null
      callback(null);
    }
  })

  const noSearchMatch = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    var divMain = document.querySelector('#main');
    var noSearchMatch = (/Your search did not match any documents/).test(divMain.textContent)
    callback(noSearchMatch);
  })

  const existResultStats = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];

    // Check it is not a update image error.
    var divMain = document.querySelector('#main');
    var imageURLnotPublicAccessible = (/The URL doesn\'t refer to an image or the image is not publicly accessible/).test(divMain.textContent)
    if (imageURLnotPublicAccessible) {
      console.error("The URL doesn't refer to an image or the image is not publicly accessible")
      throw new Error("The URL doesn't refer to an image or the image is not publicly accessible")
    }

    var imageTooBigOrNetworkSlos = (/The image is too big or the network connection is too slow to download it/).test(divMain.textContent)
    if (imageTooBigOrNetworkSlos) {
      console.error("The image is too big or the network connection is too slow to download it.")
      throw new Error("The image is too big or the network connection is too slow to download it.")
    }

    var resultStats = document.querySelector('#resultStats');

    callback(resultStats);
  })

  const getResultStats = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    try {
      var resultStats = document.querySelector('#resultStats').innerHTML;
    } catch(e) {
      console.error(e, 'getResultStats')
    }

    callback({
      innerHTML: resultStats,
      pageNum: resultStats.match(/Page (\d+)/),
      numResults: parseInt(resultStats.match(/([\d\,]*) result/)[1].replace(/,/g, '')),
      timeSearch: resultStats.match(/(\d+.\d+) seconds/)
    });
  })

  let pagesMaxNum = 21;
  let nextPage, oldNextPage, numPage, resultStat, querySearch;
  let id, urlFromId;
  // Tell if the directory is new.
  let dirNew = true;
  let ls, lastFileNumber, fileCheck;

  console.time('all files')

  try {
    // for (let i=0;i<20;i++) {
    for (let i=0;i<images.ids.length;i++) {
      id = images.ids[i]

      if (id.constructor.name == 'Array') {
        id = id[0]
      }

      urlFromId = urlSearch(id)

      console.log('processing >> ', id, urlFromId, images.data[id].pageimages["0"].thumbnail.source)
      dirNew = true
      // Check if exist directory with id.
      // Create directory, if exists.
      // No. Create and continue.
      // Yes. List directory.
      // If number of files is equal to max. Ex 21 continue to next id
      // If number is less than max. open de last file and check
      //  if number of pages result equals the number of files.
      try {
        fs.mkdirSync('./data/' + id)
      } catch (err) {
        if (err && err.code == 'EEXIST' ) {
          // Directory does exists
          console.log(err, id)

          ls = fs.readdirSync('./data/' + id)
          // Has it files?
          if (ls.length > 0) {
            dirNew = false
            // No checked if contains a extrange file!!!!!
            lastFileNumber = ls.length
            if (lastFileNumber == pagesMaxNum - 1 || ls.length >= pagesMaxNum) {
              continue
            }
            fileCheck = require(`./data/${id}/${id}-${lastFileNumber}.json`)
            // debugger
            // If no next page end or num searchs > max number searchs.
            if (!fileCheck.nextPage) {
              console.log("next ID", id)
              continue
            }
            nextPage = fileCheck.nextPage
            numPage = fileCheck.pageNum
          }
        }
      }
      if (dirNew) {
        await loadSpecial(urlFromId, id)

        if (
          await noSearchMatch() ||
          !(await existResultStats())
        ) {
          nextPage = null;
          resultStat = null;
          querySearch = null;
        } else {
          nextPage = await getNextPage();
          resultStat = await getResultStats();
          querySearch = await getFirstSearchResults();
        }
        // debugger
        numPage = 1
        try {
          fs.writeFileSync(
            `./data/${id}/${id}-1.json`,
            JSON.stringify({
              id: id,
              title: images.data[id].title,
              date: new Date(),
              pageNum: 1,
              url: urlFromId,
              querySearch,
              resultStat,
              nextPage
            })
          )
        } catch(err) {
          console.log(err, id)
        }
// debugger
        // Save data to disk
      }
      while (nextPage && numPage < pagesMaxNum) {
        await loadSpecial(nextPage)

        oldNextPage = nextPage

        console.log('await existResultStats()')
        console.log(await existResultStats())
        if (await existResultStats()) {
          nextPage = await getNextPage();
          resultStat = await getResultStats();
          querySearch = await getSearchResults();
        } else if (await noSearchMatch()) {
          nextPage = null;
          resultStat = {
            search: 'No Search Match',
            pageNum: [ numPage + 1, numPage + 1 ]
          };
          querySearch = 'No Search Match';
        } else {
          nextPage = null;
          resultStat = null;
          querySearch = null;
        }

        try {
          fs.writeFileSync(
            `./data/${id}/${id}-${parseInt(resultStat.pageNum[1])}.json`,
            JSON.stringify({
              id: id,
              title: images.data[id].title,
              date: new Date(),
              pageNum: parseInt(resultStat.pageNum[1]),
              url: oldNextPage,
              // querySearch: await getSearchResults(),
              // resultStat: await getResultStats(),
              // nextPage: await getNextPage()
              querySearch,
              resultStat,
              nextPage
            })
          )
        } catch(err) {
          console.log(err, id)
        }
      }
    }
    // images.ids.forEach()
    // await driver.get('https://www.google.co.uk/search?biw=1366&bih=598&tbs=sbi:AMhZZitqDPGPMgf35iApBjdRi1xrs3m6zavV2D20fkF_1_1w6eQxYq0Lw435xk6NXxXMzG_1Fm681_1Gu_1BC9dxsstlVj5morb7HWXIfyuMMz_1MUE8eh1CW-4HxZ88Kl12XEl9Hx0wkLlVcCkMZuJYXyf9PoKPLQVQXJTqS3s1oXy5jBh5VQ8WrbkmqD-Bv5LxJHPjTl54QtR3vREmIVYaEjymZM_1jZLJViH_1CzNd1sOyUDRp6ypMF5dRlNT8Z0m-k7Kl7E6_1d2KciXnuOp-T97AHQQJfmOcbOipKB-dOVoLqODvmIZuKbmvYMH1oSzd6sD22TeB6HiY909UzeftFoy1md5BtK1uMRh7mQ&ei=BO5gWre0EKecgAa1-q6wCA&start=0&sa=N');
    // await driver.get('https://www.google.co.uk/search?biw=1366&bih=598&tbs=sbi:AMhZZitqDPGPMgf35iApBjdRi1xrs3m6zavV2D20fkF_1_1w6eQxYq0Lw435xk6NXxXMzG_1Fm681_1Gu_1BC9dxsstlVj5morb7HWXIfyuMMz_1MUE8eh1CW-4HxZ88Kl12XEl9Hx0wkLlVcCkMZuJYXyf9PoKPLQVQXJTqS3s1oXy5jBh5VQ8WrbkmqD-Bv5LxJHPjTl54QtR3vREmIVYaEjymZM_1jZLJViH_1CzNd1sOyUDRp6ypMF5dRlNT8Z0m-k7Kl7E6_1d2KciXnuOp-T97AHQQJfmOcbOipKB-dOVoLqODvmIZuKbmvYMH1oSzd6sD22TeB6HiY909UzeftFoy1md5BtK1uMRh7mQ&ei=UmlfWqPYNKHNgAan_YKYDg&start=10&sa=N');
    // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);

    console.timeEnd('all files')
    // console.log( await driver.findElement(By.id('rso')) );
    var n = images;
    // debugger
    // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    // await driver.quit();
  }
})();
