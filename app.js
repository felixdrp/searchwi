
const fs = require('fs');
const fileName = 'busqueda-bing.html'

var imageInputSearchGoogle = require('./image-input-search-google')
var imageInputSearchBing = require('./image-input-search-bing')
const imageTest1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Angela_Merkel_%282008%29.jpg/1024px-Angela_Merkel_%282008%29.jpg'
const imageTest2 = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Angela_Merkel_%282008%29.jpg'

async function a(){
//  let IISGoogle = imageInputSearchGoogle.searchWithImage('http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg')
  let IISBing = await imageInputSearchBing.searchWithImage(imageTest2)

//  console.log(await IISGoogle)
  console.log( IISBing)
  fs.writeFile(fileName, IISBing, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('web saved!');
  });

}

a()
