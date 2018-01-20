
const fs = require('fs');
const fileName = 'busqueda-google.html'
var cheerio = require('cheerio'),
    $ = cheerio.load('<h2 class = "title">Hello world</h2>');

var imageInputSearchGoogle = require('./image-input-search-google')

const j = 'http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg'
const imageTest1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Angela_Merkel_%282008%29.jpg/1024px-Angela_Merkel_%282008%29.jpg'
const imageTest2 = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Angela_Merkel_%282008%29.jpg'

async function a(){
  let IISGoogle = await imageInputSearchGoogle.searchWithImage(imageTest1)

  console.log( IISGoogle)
debugger
  fs.writeFile(fileName, JSON.stringify(IISGoogle), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('web saved!');
  });

}

a()
