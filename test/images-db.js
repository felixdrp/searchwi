const tap = require('tap');
const {promisify} = require('util');
// tap.jobs = 6
const fsPromises = require('fs/promises');

const imagesDB = require('../images-db/images-db');

const IMG_DB_TEST = {"data":{"68508763":{"pageimages":[{"pageid":68508763,"ns":6,"title":"File:Balearica regulorum - Karlsruhe Zoo 02.jpg","thumbnail":{"source":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg/35px-Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg","width":35,"height":50},"pageimage":"Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg"}],"title":"File:Balearica regulorum - Karlsruhe Zoo 02.jpg"}},"ids":[68508763],"titles":["File:Balearica regulorum - Karlsruhe Zoo 02.jpg"],"titleToId":{"File:Balearica regulorum - Karlsruhe Zoo 02.jpg":68508763}};

const DATA_REG = {
  "pageimages": [
    {
      "pageid": 68508763,
      "ns": 6,
      "title": "File:Balearica regulorum - Karlsruhe Zoo 02.jpg",
      "thumbnail": {
       "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg/35px-Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg",
       "width": 35,
       "height": 50
      },
      "pageimage": "Balearica_regulorum_-_Karlsruhe_Zoo_02.jpg"
    }
  ]
}

tap.test('Create image-DB.', assert => {
  let imDB = new imagesDB()
  let imDB2 = new imagesDB(IMG_DB_TEST)

  assert.equal(
    JSON.stringify(imDB.get()),
    JSON.stringify({})
  );

  imDB.add({
    data: DATA_REG,
    key: DATA_REG.pageimages[0].pageid,
    title: DATA_REG.pageimages[0].title,
  })

  assert.equal(
    JSON.stringify(imDB.get()),
    JSON.stringify(imDB2.get()),
  );
  assert.end();
});


tap.test('Change title of element by key and title.', assert => {
  let imDB = new imagesDB()
  let key = DATA_REG.pageimages[0].pageid
  let title = DATA_REG.pageimages[0].title
  let helloWorld = 'hello world'
  imDB.add({
    data: DATA_REG,
    key,
    title,
  })
  imDB.edit({
    data: {title: ''},
    key,
    // title: DATA_REG.pageimages[0].title,
  })
  imDB.edit({
    data: {title: helloWorld},
    title,
  })
  assert.equal(
    imDB.get().data[key].title,
    helloWorld
  );
  assert.end();
});

tap.test('Delete element.', assert => {
  let imDB = new imagesDB()
  let key = DATA_REG.pageimages[0].pageid
  let title = DATA_REG.pageimages[0].title
  let helloWorld = 'hello world'

  imDB.add({
    data: DATA_REG,
    key,
    title,
  })
  imDB.delete({
    key,
    title,
  })

  assert.equal(
    JSON.stringify(imDB.get()),
    '{"data":{},"ids":[],"titles":[],"titleToId":{}}',
  );
  assert.end();
});

tap.test('Save image-DB.', async (assert) => {
  let filename = './test/test.json'
  let imDB = new imagesDB(IMG_DB_TEST)
  await imDB.save(filename)
  let readFile = await fsPromises.readFile(filename, 'utf8')
  fsPromises.unlink(filename)
  assert.equal(
    readFile,
    JSON.stringify(IMG_DB_TEST),
  );
  assert.end();
});
