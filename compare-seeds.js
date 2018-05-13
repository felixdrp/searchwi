const fsPromises = require('fs/promises');

let valued = require('./data-seeds/valued-images-seed.json')
let featured = require('./data-seeds/featured-images-seed.json')
let quality = require('./data-seeds/quality-images-seed.json')

const fileName = './data-seeds/main-seed.json'
const fileFiltered = './data-seeds/main-seed-filtered.json'

fileType = /gif|jpeg|jpg|png/i

function get11kRandomFromArray(vector) {
  const MAX_LENGTH = 11e3
  let random11k = []
  let filtered = Object.assign([], vector)
  do {
    random11k.push(
      filtered.splice(Math.floor(Math.random(filtered.length)), 1)[0]
    )
  } while (
    random11k.length < MAX_LENGTH &&
    random11k.length < vector.length
  )

  return random11k
}

async function destile() {
  let mainSeed
  try {
    mainSeed = await fsPromises.readFile(fileName, 'utf8')
    mainSeed = JSON.parse(mainSeed)
  } catch(err) {
    mainSeed = {}
    console.error(err);
  }

  valued.random.length
  quality.random.length
  featured.random.length
  // let fv = mainSeed.valuedFeatured
  // let fq = mainSeed.qualityFeatured
  // let vq = mainSeed.valuedQuality

  if (!mainSeed.featuredDestiled) {
    let valuedFeatured = valued.random.filter(e=>featured.random.includes(e))
    let valuedQuality = valued.random.filter(e=>quality.random.includes(e))
    let qualityFeatured = quality.random.filter(e=>featured.random.includes(e))
    let valuedQualityFeatured = quality.random.filter(e=>valuedFeatured.includes(e))

    let fv = valuedFeatured
    let fq = qualityFeatured
    let vq = valuedQuality
    let fqv = valuedQualityFeatured

    let valuedFeaturedDestiled = valuedFeatured.filter(e=>!valuedQualityFeatured.includes(e))
    let valuedQualityDestiled = valuedQuality.filter(e=>!valuedQualityFeatured.includes(e))
    let qualityFeaturedDestiled = qualityFeatured.filter(e=>!valuedQualityFeatured.includes(e))

    let valuedDestiled = valued.random
      .filter(e=>!valuedFeatured.includes(e))
      .filter(e=>!valuedQualityDestiled.includes(e))

    let qualityDestiled = quality.random
      .filter(e=>!qualityFeatured.includes(e))
      .filter(e=>!valuedQualityDestiled.includes(e))

    let featuredDestiled = featured.random
      .filter(e=>!qualityFeatured.includes(e))
      .filter(e=>!valuedFeaturedDestiled.includes(e))

    valuedDestiled = get11kRandomFromArray(valuedDestiled)
    qualityDestiled = get11kRandomFromArray(qualityDestiled)
    featuredDestiled = get11kRandomFromArray(featuredDestiled)

    mainSeed = {
      valuedDestiled,
      qualityDestiled,
      featuredDestiled,

      valuedFeaturedDestiled,
      valuedQualityDestiled,
      qualityFeaturedDestiled,

      valuedQualityFeatured,
    }
  } else {
    mainSeed2 = {
      valuedDestiled: mainSeed.valuedDestiled.filter(e=>fileType.test(e)),
      qualityDestiled: mainSeed.qualityDestiled.filter(e=>fileType.test(e)),
      featuredDestiled: mainSeed.featuredDestiled.filter(e=>fileType.test(e)),

      valuedFeaturedDestiled: mainSeed.valuedFeaturedDestiled.filter(e=>fileType.test(e)),
      valuedQualityDestiled: mainSeed.valuedQualityDestiled.filter(e=>fileType.test(e)),
      qualityFeaturedDestiled: mainSeed.qualityFeaturedDestiled.filter(e=>fileType.test(e)),

      valuedQualityFeatured: mainSeed.valuedQualityFeatured.filter(e=>fileType.test(e)),
    }

    try {
      await fsPromises.writeFile(fileFiltered, JSON.stringify(mainSeed2))
      // success case, the file was saved
      console.log('DB filtered saved!');
    } catch(err) {
      throw err;
    }
  }

  try {
    await fsPromises.writeFile(fileName, JSON.stringify(mainSeed))

    // success case, the file was saved
    console.log('DB saved!');
  } catch(err) {
    throw err;
  }

  // let valuedFeatured = valued.random.filter(e=>featured.random.includes(e))
  // let valuedQuality = valued.random.filter(e=>quality.random.includes(e))
  // let qualityFeatured = quality.random.filter(e=>featured.random.includes(e))
  //
  // let fv = valuedFeatured
  // let fq = qualityFeatured
  // let vq = valuedQuality
  //
  // let valuedQualityFeatured = quality.random.filter(e=>valuedFeatured.includes(e))
  // let fqv = valuedQualityFeatured
  //
  //
  // // total images => 46,415,824
  //
  // // valued => 26252
  // // quality => 183505
  // // featured => 11178
  // f = 11178
  // v = 26252
  // q = 183505
  //
  // // valued ∩ featured => 1027
  // // valued ∩ quality => 10576
  // // quality ∩ featured => 6146
  // fv = 1027
  // fq = 6146
  // vq = 10576
  //
  // // valued ∩ quality ∩ featured => 878
  // fqv = 878
  //
  // // Destiled data without other flavours.
  // fDestiled = f - (fq + fv - fqv)
  // // 4883
  // vDestiled = v - (vq + fv - fqv)
  // // 15527
  // qDestiled = q - (fq + vq - fqv)
  // // 167661
  //
  // console.log(valuedQualityFeatured)
}
(async function() {
  try {
    await destile()
  } catch(err) {
    throw err;
  }
})()
