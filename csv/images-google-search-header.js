// CSV Header titles
const titles = {
  ID: 'id',
  RANK: 'rank',
  TITLE: 'title',
  URL: 'url',
  URL_GREEN: 'sub url',
  ABSTRACT: 'abstract',
  TOP_LEVEL_DOMAIN: 'top level domain',
  SUB_DOMAIN: 'sub domain',
  DOMAIN: 'domain',
  UE_DOMAIN: 'european domain',
  GENERAL_DOMAIN: 'general domain'
}

// Array header order in csv archive
const CSV_HEADER = [
  titles.ID,
  titles.RANK,
  titles.URL,
  titles.TITLE,
  titles.ABSTRACT,
  titles.URL_GREEN,
  titles.TOP_LEVEL_DOMAIN,
  titles.SUB_DOMAIN,
  titles.DOMAIN,
  titles.UE_DOMAIN,
  titles.GENERAL_DOMAIN
]

module.exports = {
  ...titles,
  CSV_HEADER
};
