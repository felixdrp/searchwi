const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const fs = require('fs');
const images = require('./images-with-metadata.json');

require('geckodriver');
const {Builder, By, Key, until} = require('selenium-webdriver');

// Get url of the 1024px thumbnail image of an image id.
const urlSearch = (id) => {
  let thumb = images.data[id].pageimages["0"].thumbnail.source
  // thumb = thumb.replace(/\d+px/, '1024px')
  // thumb = thumb.replace(/\d+px/, '768px')
  thumb = thumb.replace(/\d+px/, '640px')
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

  const getFirstSearchResults = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    var a = document.querySelector('#rso');
    // if class rso is used
    var rso = document.querySelectorAll('.srg')
    var g = document.querySelectorAll('#rso>div:last-child .g')
    var elementOverLastChildren = a.children[a.childElementCount - 2];
    var elements = [];
    if (a.childElementCount > 2) {
      for (let i of g) {
        let url, urlmatch, urlGreen, abstract
        let innerChildrenCount = i.children[0].children[0].children[1].childElementCount
        url = i.children[0].children[0].children[0].children[0].href
        urlmatch = url.match(/^https:\/\/www.google.*(&url=)(.*)(?:\&)/)
        if (urlmatch >= 2) {
          url = decodeURIComponent(url[2])
        }
        // Check if search line has image.
        if (i.children[0].children[0].children[1].childElementCount > 1) {
          urlGreen = i.children[0].children[0].children[1].children[1].children[0].children[0].innerText,
          abstract = i.children[0].children[0].children[1].children[1].children[1].innerText
        } else {
          urlGreen = i.children[0].children[0].children[1].children[0].children[0].innerText,
          abstract = i.children[0].children[0].children[1].children[0].children[1].innerText
        }

        elements.push({
          title: i.children[0].children[0].children[0].children[0].innerText,
          url: url,
          urlGreen: urlGreen,
          abstract: abstract
        })
      }
    }

    callback({
      searchRaw: a.innerHTML,
      results: elements
    });
  })

  const getSearchResults = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    var a = document.querySelector('#rso');
    var g = document.querySelectorAll('#rso>div:last-child .g')
    var elementOverLastChildren = a.children[a.childElementCount - 2];
    var elements = [];

    if (a.childElementCount > 2) {
      for (let n of g) {
        let url, urlmatch, urlGreen, abstract
        url = n.children[0].children[0].children[0].children[0].href
        urlmatch = url.match(/^https:\/\/www.google.*(&url=)(.*)(?:\&)/)
        if (urlmatch >= 2) {
          url = decodeURIComponent(url[2])
        }
        // Check if search line has image.
        if (n.children[0].children[0].children[1].childElementCount > 1) {
          urlGreen = n.children[0].children[0].children[1].children[1].children[0].children[0].innerText,
          abstract = n.children[0].children[0].children[1].children[1].children[1].innerText
        } else {
          urlGreen = n.children[0].children[0].children[1].children[0].children[0].innerText,
          abstract = n.children[0].children[0].children[1].children[0].children[1].innerText
        }

        elements.push({
          title: n.children[0].children[0].children[0].children[0].innerText,
          url: url,
          urlGreen: urlGreen,
          abstract: abstract
        })
      }
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
    var resultStats = document.querySelector('#resultStats');
    callback(resultStats);
  })

  const getResultStats = () => driver.executeAsyncScript(function () {
    var callback = arguments[arguments.length - 1];
    var resultStats = document.querySelector('#resultStats').innerHTML;
    callback({
      innerHTML: resultStats,
      pageNum: resultStats.match(/Page (\d+)/),
      numResults: parseInt(resultStats.match(/([\d\,]*) results/)[1].replace(/,/g, '')),
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

      console.log('processing >> ', id, urlFromId)
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
        //Humanize the access to google
        await randomOMaticVsBot()

        await driver.get(urlFromId);
        await awaitingUpload()

        // nextPage = await getNextPage();
        // resultStat = await getResultStats();
        // querySearch = await getFirstSearchResults();

        if (await noSearchMatch()) {
          nextPage = null;
          resultStat = null;
          querySearch = null;
        } else {
          nextPage = await getNextPage();
          resultStat = await getResultStats();
          querySearch = await getFirstSearchResults();
        }

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
        //Humanize the access to google
        await randomOMaticVsBot()

        await driver.get(nextPage);
        await awaitingUpload()
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
