var imageInputSearch = require('./image-input-search')

async function a(){
  console.log(await imageInputSearch.searchWithImage('http://www.dcs.gla.ac.uk/~jesus/photos/me2.jpg'))
}

a()
