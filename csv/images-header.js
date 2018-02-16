// CSV Header titles
const titles = {
  ID: 'id',
  TITLE: 'title',
  URL: 'url',
  METADATA_GLOBAL_USAGE_COUNT: 'meta_globalusage_count',
  GOOGLE_IMAGE_SEARCH_HIT_COUNT: 'google_image_search_hit_count',

  TYPE: 'type',
  SIZE: 'size',
  HEIGHT: 'height',
  WIDTH: 'width',
  // Example if the image is featured.
  ASSESSMENTS: 'assessments',
  CATEGORIES: 'categories',

  LICENSE: 'license',
  LICENSEURL: 'licenseurl',
  PERMISSION: 'permission',
  RESTRICTIONS: 'restrictions',
  USAGETERMS: 'usageterms',
  ARTIST: 'artist',
  CREDIT: 'credit',
  ATTRIBUTION: 'attribution'
}

// Array header order in csv archive
const CSV_HEADER = [
  titles.ID,
  titles.TITLE,
  titles.URL,
  titles.METADATA_GLOBAL_USAGE_COUNT,
  titles.GOOGLE_IMAGE_SEARCH_HIT_COUNT,
  titles.TYPE,
  titles.SIZE,
  titles.HEIGHT,
  titles.WIDTH,
  titles.ASSESSMENTS,
  titles.CATEGORIES,
  titles.LICENSE,
  titles.LICENSEURL,
  titles.PERMISSION,
  titles.RESTRICTIONS,
  titles.USAGETERMS,
  titles.ARTIST,
  titles.CREDIT,
  titles.ATTRIBUTION
]

module.exports = {
  ...titles,
  CSV_HEADER
};
